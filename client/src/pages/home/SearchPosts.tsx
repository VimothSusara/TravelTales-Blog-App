import { Loader2, Search, X } from "lucide-react";

import { useEffect, useState } from "react";
import Select, { components, OptionProps, SingleValueProps } from "react-select";

import { getCountries } from "@/services/countriesService";

import { Country } from "@/types/country";
import { Button } from "@/components/ui/button";
import { Post } from "@/types/blog";
import RecentPostCard from "@/components/cards/PostCard";
import { getPosts } from "@/services/blogService";

interface CountryOption {
  value: string;
  label: string;
  flagUrl: string;
  country: Country; // Store the full country object for potential additional data needs
}
interface FilterOption {
  value: "newest" | "popular" | "most_liked" | "most_commented";
  label: string;
}

// Properly typed custom components
const Option = ({ children, ...props }: OptionProps<CountryOption>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      {props.data.flagUrl && (
        <img
          src={props.data.flagUrl}
          alt={props.data.label}
          className="w-5 h-5 object-cover rounded"
        />
      )}
      {children}
    </div>
  </components.Option>
);

const SingleValue = ({
  children,
  ...props
}: SingleValueProps<CountryOption>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      {props.data.flagUrl && (
        <img
          src={props.data.flagUrl}
          alt={props.data.label}
          className="w-5 h-5 object-cover rounded"
        />
      )}
      {children}
    </div>
  </components.SingleValue>
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

const SearchPosts = () => {
  const [country, setCountry] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(
    null
  );
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [filter, setFilter] = useState<FilterOption | null>(null);
  const [author, setAuthor] = useState<string>("");
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
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
    loadCountries();
  }, []);

  const handleSearch = async () => {
    try {
      setIsLoadingPosts(true);
      const response = await getPosts(
        {
          country: country,
          sort_by: filter?.value,
          limit: 10,
          page: 1,
          author,
        },
        null
      );

      if (response.data.success) {
        setPosts(response.data.blogs);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [country, filter, author]);

  const handleFilterChange = (option: FilterOption | null) => {
    setFilter(option);
  };

  const handleCountryChange = (selectedOption: CountryOption | null) => {
    setSelectedCountry(selectedOption);
    setCountry(selectedOption ? selectedOption.value : "");
  };

  const handleClearFilters = () => {
    setSelectedCountry(null);
    setCountry("");
    setFilter(null);
  };

  const filterOptions: FilterOption[] = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "most_liked", label: "Most Liked" },
    { value: "most_commented", label: "Most Commented" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="gap-2 sticky bg-background z-20 py-2 px-3 top-0">
        <h1 className="text-3xl font-bold mb-6">Discover Travel Stories</h1>

        <div className="flex flex-wrap gap-2 align-center">
          <div className="w-full md:w-1/3">
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
                placeholder="Select country"
                isClearable
                className="country-select"
                classNamePrefix="country-select"
                components={{ Option, SingleValue }}
                isSearchable
              />
            )}
          </div>
          <div className="w-full md:w-1/4">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Enter Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/4">
            <Select
              options={filterOptions}
              value={filter}
              onChange={handleFilterChange}
              placeholder="Sort By"
              isClearable
              isSearchable
              styles={selectStyles}
            />
          </div>
          <div className="flex gap-1 align-middle justify-center">
            <Button
              variant="ghost"
              className="cursor-pointer p-0 m-0 flex justify-center"
              size={"sm"}
              onClick={handleSearch}
            >
              <Search className="mr-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              className="cursor-pointer p-0 m-0 flex justify-center"
              size={"sm"}
              onClick={handleClearFilters}
            >
              <X className="mr-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full h-full overflow-y-auto hide-scrollbar scrollable-container">
        {isLoadingPosts ? (
          <div className="flex items-center space-x-2 p-2 border rounded">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-gray-500">Loading posts...</span>
          </div>
        ) : (
          posts.map((post) => <RecentPostCard key={post.id} post={post} />)
        )}{" "}
      </div>
    </div>
  );
};

export default SearchPosts;
