import { ChangeEvent, useEffect, useRef, useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2 } from "lucide-react";
import { ToastContainer, toast, Flip } from "react-toastify";
import Select, { components } from "react-select";

//types
import { Country } from "@/types/country";

//services
import { editPost, getPost } from "@/services/blogService";
import { getCountries } from "@/services/countriesService";
import { useNavigate, useParams } from "react-router-dom";
import { getImageUrl } from "@/utils/imageLink";
import useAuthStore from "@/store/authStore";

const Option = (props: any) => (
  <components.Option {...props}>
    <div className="flex items-center">
      <img
        src={props.data.flagUrl}
        alt={`${props.data.label} flag`}
        className="w-5 h-4 mr-2 object-cover"
      />
      {props.data.value}
    </div>
  </components.Option>
);

const SingleValue = (props: any) => (
  console.log("Props: ", props),
  (
    <components.SingleValue {...props}>
      <div className="flex items-center">
        <img
          src={props.data.flagUrl}
          alt={`${props.data.label} flag`}
          className="w-5 h-4 mr-2 object-cover"
        />
        {props.data.value}
      </div>
    </components.SingleValue>
  )
);

const selectStyles = {
  control: (base: any) => ({
    ...base,
    borderRadius: "0.375rem",
    borderColor: "#e2e8f0",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#cbd5e1",
    },
    padding: "2px",
  }),
  option: (base: any, state: { isSelected: boolean; isFocused: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#e2e8f0"
      : state.isFocused
      ? "#f1f5f9"
      : undefined,
    color: "#1e293b",
    "&:active": {
      backgroundColor: "#e2e8f0",
    },
  }),
};

interface CountryOption {
  value: string;
  label: string;
  flagUrl: string;
  country: Country; // Store the full country object for potential additional data needs
}

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 border rounded">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 ${
          editor.isActive("bold") ? "bg-gray-200" : "bg-gray-100"
        }`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 ${
          editor.isActive("italic") ? "bg-gray-200" : "bg-gray-100"
        }`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 ${
          editor.isActive("underline") ? "bg-gray-200" : "bg-gray-100"
        }`}
      >
        Underline
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 ${
          editor.isActive("heading", { level: 1 })
            ? "bg-gray-200"
            : "bg-gray-100"
        }`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 ${
          editor.isActive("heading", { level: 2 })
            ? "bg-gray-200"
            : "bg-gray-100"
        }`}
      >
        H2
      </button>
    </div>
  );
};

const EditPost = () => {
  const { user } = useAuthStore();
  const { id: blog_id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [country, setCountry] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null
  );
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
    },
  });

  const loadCountries = async () => {
    setIsLoadingCountries(true);
    try {
      const response = await getCountries();

      const filteredCountries: CountryOption[] = response.data.map(
        (country: Country) => ({
          value: country.name,
          label: country.name,
          flagUrl: country.flags.svg || country.flags.png,
          country,
        })
      );

      setCountries(filteredCountries);

      console.log(response.data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  const loadPost = async () => {
    if (!blog_id) return;

    setIsLoadingPost(true);
    try {
      const response = await getPost(blog_id, user ? user?.id : null);

      if(response.data.blog.author.id !== user?.id) {
        toast.error("You are not authorized to edit this post.");
        navigate("/");
        return
      }

      setTitle(response.data.blog.title);
      setContent(response.data.blog.content);
      setCountry(response.data.blog.country_name);

      if (editor) {
        editor.commands.setContent(response.data.blog.content);
      }

      console.log("Blog: ", response.data.blog);

      if (response.data.blog.country_name && countries.length > 0) {
        const selectedCountry = countries.find(
          (country) => country.value === response.data.blog.country_name
        );
        if (selectedCountry) {
          setSelectedCountry(selectedCountry || null);
        }
      }

      if (response.data.blog.image_url) {
        const imageUrl = getImageUrl(response.data.blog.image_url);
        setCurrentImageUrl(imageUrl || null);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load post. Please try again later.");
      navigate("/");
    } finally {
      setIsLoadingPost(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadCountries();
      await loadPost();
    };

    loadData();
  }, [blog_id, editor]);

  useEffect(() => {
    if (country && countries.length > 0) {
      const selectedCountry = countries.find((c) => c.value === country);
      if (selectedCountry) {
        setSelectedCountry(selectedCountry);
      }
    }
  }, [countries, country]);

  const handleCountryChange = (selectedOption: CountryOption | null) => {
    setSelectedCountry(selectedOption);
    setCountry(selectedOption ? selectedOption.value : "");
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      alert("Please select an image file");
      return;
    }

    setImage(file);
    setCurrentImageUrl(null);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setCurrentImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !country) {
      toast.error("Title, Content and Country are required.");
      return;
    }

    if (!blog_id) {
      toast.error("Invalid post ID");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("country_name", country);

      if (image) {
        formData.append("blog_image", image);
      } else if (!currentImageUrl) {
        formData.append("remove_image", "true");
      }

      const response = await editPost(formData, blog_id);

      if (!response.data.success) {
        toast.error(
          response.data?.message ||
            "Failed to update blog post. Please try again later."
        );
        return;
      }

      console.log("Updated return: ", response.data);

      toast.success("Blog post updated successfully");
      navigate(`/blog/${user?.username}/${response.data.blog.slug}/${blog_id}`);
    } catch (error) {
      console.error("Error updating blog post:", error);
      toast.error("Failed to update blog post. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading post...</span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-2 mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Select Country
          </label>
          {isLoadingCountries ? (
            <div className="flex items-center space-x-2 p-2 border rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">
                Loading countries...
              </span>
            </div>
          ) : (
            <Select
              options={countries}
              styles={selectStyles}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder="Search or select a country"
              isClearable
              className="country-select"
              classNamePrefix="country-select"
              components={{ Option, SingleValue }}
              isSearchable
            />
          )}
        </div>

        <div className="border rounded">
          <Toolbar editor={editor} />
          <EditorContent editor={editor} className="p-2" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Featured Image
          </label>

          {imagePreview ? (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : currentImageUrl ? (
            <div className="relative group">
              <img
                src={currentImageUrl}
                alt="Current"
                className="w-full h-64 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-400">JPG, PNG up to 5MB</p>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full md:w-1/3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-1/3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Blog Post"
            )}
          </Button>
        </div>
      </form>
      <ToastContainer
        position="top-center"
        autoClose={1200}
        hideProgressBar={true}
        closeOnClick={false}
        theme="dark"
        transition={Flip}
      />
    </div>
  );
};

export default EditPost;
