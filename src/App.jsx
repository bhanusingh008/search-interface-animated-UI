import { useState, useEffect } from "react";
import { Search, Settings, Folder, Image, Play, User, ExternalLink, Copy } from "lucide-react";

const App = () => {
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [filterSettings, setFilterSettings] = useState({
    files: true,
    people: true,
    chats: false,
    lists: false,
  });
  const [toast, setToast] = useState({ show: false, x: 0, y: 0 });

  const tabs = [
    { name: "All", count: 8 },
    { name: "Files", count: 6 },
    { name: "People", count: 2 },
    { name: "Chats", count: 0 },
    { name: "Lists", count: 0 },
  ];

  const searchResults = [
    {
      type: "person",
      name: "Randall Johnsson",
      status: "Active now",
      avatar: "/api/placeholder/32/32",
      isActive: true,
      url: "https://example.com/users/randall-johnsson",
    },
    {
      type: "folder",
      name: "Random Michal Folder",
      location: "Photos",
      fileCount: "12 Files",
      timestamp: "Edited 12m ago",
      url: "https://example.com/folders/random-michal-folder",
    },
    {
      type: "file",
      name: "crative_file_frankies.jpg",
      location: "Photos/Assets",
      timestamp: "Edited 12m ago",
      fileType: "image",
      url: "https://example.com/files/crative-file-frankies.jpg",
    },
    {
      type: "person",
      name: "Kristinge Karand",
      status: "Active 2d ago",
      avatar: "/api/placeholder/32/32",
      isActive: false,
      url: "https://example.com/users/kristinge-karand",
    },
    {
      type: "file",
      name: "files_krande_michelle.avi",
      location: "Videos",
      timestamp: "Added 12m ago",
      fileType: "video",
      url: "https://example.com/files/files-krande-michelle.avi",
    },
  ];

  const clearSearch = () => {
    setSearchValue("");
    setIsLoading(false);
  };

  // Function to copy link to clipboard
  const copyToClipboard = async (url, event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);

      // Show toast at cursor location
      setToast({
        show: true,
        x: event.clientX,
        y: event.clientY,
      });

      // Hide toast after 1 second
      setTimeout(() => {
        setToast({ show: false, x: 0, y: 0 });
      }, 1000);

      console.log("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  // Function to open link in new tab
  const openInNewTab = (url, event) => {
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Toggle filter settings
  const toggleFilterSetting = (key) => {
    setFilterSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filterResults = (tabName = "All", searchValue) => {
    // Filter results based on search value and active tab
    const filteredResults = searchResults.filter((result) => {
      if (searchValue === undefined || searchValue.trim() === "") return false;

      // Filter by search term
      const matchesSearch = result.name.toLowerCase().includes(searchValue.toLowerCase()) || (result.location && result.location.toLowerCase().includes(searchValue.toLowerCase()));

      // Filter by active tab
      let matchesTab = true;
      if (tabName === "People") {
        matchesTab = result.type === "person";
      } else if (tabName === "Files") {
        matchesTab = result.type === "file" || result.type === "folder";
      }
      // "All" tab shows everything, so no additional filtering needed

      return matchesSearch && matchesTab;
    });

    return filteredResults;
  };

  // Update tab counts based on current search
  const getTabCount = (tabName) => {
    if (isLoading) return "...";
    if (tabName === "All") {
      return filterResults("All", searchValue).length;
    } else if (tabName === "People") {
      return filterResults("People", searchValue).length;
    } else if (tabName === "Files") {
      return filterResults("Files", searchValue).length;
    }

    return 0;
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case "image":
        return <Image size={16} className="text-gray-500" />;
      case "video":
        return <Play size={16} className="text-gray-500" />;
      default:
        return <Folder size={16} className="text-gray-500" />;
    }
  };

  // Function to highlight matching keywords
  const highlightText = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 font-semibold rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getResultIcon = (result) => {
    if (result.type === "person") {
      return (
        <div className="relative w-8 h-8">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white">
            <User size={16} />
          </div>
          {result.isActive && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>}
        </div>
      );
    } else if (result.type === "folder") {
      return <Folder size={16} className="text-blue-500" />;
    } else {
      return getFileIcon(result.fileType);
    }
  };

  // Skeleton loading component
  const SkeletonResultItem = ({ index }) => (
    <div className="flex items-center px-5 py-3 gap-3 animate-in fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <div className="flex-shrink-0 w-8 h-8">
        <div className="w-8 h-8 rounded-full skeleton"></div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <div className="h-4 skeleton rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 skeleton rounded" style={{ width: "40px" }}></div>
          <div className="h-3 skeleton rounded" style={{ width: "60px" }}></div>
          <div className="h-3 skeleton rounded" style={{ width: "80px" }}></div>
        </div>
      </div>
    </div>
  );

  // Handle loading state with 1 second delay
  useEffect(() => {
    if (searchValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [searchValue]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSettingsMenu && !event.target.closest(".settings-container")) {
        setShowSettingsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettingsMenu]);

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center p-5">
      <div className="w-full max-w-xl bg-white rounded-[24px] shadow-lg overflow-hidden transition-all duration-500 ease-linear">
        <div className="flex items-center rounded-sm gap-3 transition-all duration-300 ease-linear">
          <div className="flex-1 flex items-center rounded-lg px-4 py-3 gap-3 transition-all duration-300 ease-linear focus-within:ring-blue-500/20">
            <Search size={18} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search..."
              className="h-[48px] flex-1 border-none bg-transparent outline-none text-base text-gray-800 placeholder-gray-400 caret-blue-600"
              style={{ caretColor: "#2563eb" }}
            />
            {searchValue && (
              <button
                onClick={clearSearch}
                className="text-gray-500 text-sm font-medium px-3 py-2 rounded-md hover:bg-gray-200 transition-all duration-200 ease-linear underline"
                style={{
                  animation: "fadeInSlide 300ms ease-linear forwards",
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className={`transition-all duration-500 ease-linear overflow-hidden ${searchValue ? "h-[450px] opacity-100" : "h-0 opacity-0"}`}>
          <div className="flex justify-between px-5 border-b border-gray-200">
            <div className="flex items-center">
              {tabs
                .filter((tab) => filterSettings[tab.name.toLowerCase()] === true || tab.name === "All")
                .map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-1.5 py-3 mr-6 text-sm font-medium transition-colors relative ${
                      activeTab === tab.name ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:rounded-t" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.name}
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${activeTab === tab.name ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>{getTabCount(tab.name)}</span>
                  </button>
                ))}
            </div>

            <div className="relative settings-container">
              <button onClick={() => setShowSettingsMenu(!showSettingsMenu)} className="p-3 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                <Settings size={18} />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  {[
                    { key: "files", label: "Files", icon: <Folder size={16} /> },
                    { key: "people", label: "People", icon: <User size={16} /> },
                    { key: "chats", label: "Chats", icon: <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div> },
                    {
                      key: "lists",
                      label: "Lists",
                      icon: (
                        <div className="w-4 h-4 flex flex-col justify-center">
                          <div className="h-0.5 bg-gray-400 mb-0.5"></div>
                          <div className="h-0.5 bg-gray-400 mb-0.5"></div>
                          <div className="h-0.5 bg-gray-400"></div>
                        </div>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleFilterSetting(item.key)}>
                      <div className="flex items-center gap-3">
                        <div className="text-gray-500">{item.icon}</div>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className={`w-10 h-5 rounded-full transition-colors duration-200 ease-in-out ${filterSettings[item.key] ? "bg-blue-600" : "bg-gray-300"}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out transform ${filterSettings[item.key] ? "translate-x-5" : "translate-x-0.5"} mt-0.5`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-y-auto py-2 h-[380px]">
            {isLoading ? (
              // Show skeleton loading
              Array.from({ length: 5 }).map((_, index) => <SkeletonResultItem key={index} index={index} />)
            ) : filterResults(activeTab, searchValue).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-5 text-gray-500 transition-all duration-300 ease-linear">
                <Search size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No results found</p>
                <p className="text-sm text-center">Try adjusting your search terms or selected tab</p>
              </div>
            ) : (
              filterResults(activeTab, searchValue).map((result, index) => (
                <div key={index} className="flex items-center px-5 py-3 gap-3 hover:bg-gray-50 transition-colors group">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{getResultIcon(result)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-0.5 truncate">{highlightText(result.name, searchValue)}</div>
                    <div className="text-xs text-gray-500 flex items-center flex-wrap gap-1">
                      {result.type === "person" ? (
                        <span className={result.isActive ? "text-green-600 font-medium" : "text-gray-400"}>{result.status}</span>
                      ) : (
                        <>
                          {result.location && (
                            <>
                              <span>in {highlightText(result.location, searchValue)}</span>
                              {result.fileCount && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span>{result.fileCount}</span>
                                </>
                              )}
                              <span className="text-gray-300">•</span>
                            </>
                          )}
                          <span className="text-gray-400">{result.timestamp}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => openInNewTab(result.url, e)} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors" title="Open in new tab">
                      <ExternalLink size={14} />
                    </button>
                    <button onClick={(e) => copyToClipboard(result.url, e)} className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors" title="Copy link">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <div
          className="toast"
          style={{
            left: toast.x,
            top: toast.y - 10,
          }}
        >
          Link copied
        </div>
      )}
    </div>
  );
};

export default App;
