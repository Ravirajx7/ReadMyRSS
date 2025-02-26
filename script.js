document.addEventListener("DOMContentLoaded", () => {
    const articlesContainer = document.getElementById("articles");
    const categoryFilter = document.getElementById("category-filter");
    const refreshButton = document.getElementById("refresh-feeds");
    const themeToggle = document.getElementById("theme-toggle");

    // 🔹 Use a Different Proxy (Free & Works with RSS Feeds)
    const CORS_PROXY = "https://api.allorigins.win/get?url=";

    // 🔹 RSS Feeds List
    const feeds = {
        tech: [
            { url: "https://news.ycombinator.com/rss", name: "Hacker News" }, // The best for startup & tech insights
            { url: "https://stratechery.com/feed/", name: "Stratechery" }, // Ben Thompson's insights on tech & business
            { url: "https://rootsofprogress.org/feed.xml", name: "The Roots of Progress" } // Progress & human innovation
        ],
        philosophy: [
            { url: "https://dailystoic.com/feed/", name: "The Daily Stoic" }, // Timeless wisdom
            { url: "https://aeon.co/feed.rss", name: "Aeon" }, // Deep philosophical essays
            { url: "https://www.lesswrong.com/feed.xml", name: "LessWrong" }, // Rationality & AI alignment
        ],
        investing: [
            { url: "https://www.epsilontheory.com/feed/", name: "Epsilon Theory" }, // Narrative-driven macro investing
            { url: "https://feeds.feedburner.com/farnamstreet", name: "Farnam Street" }, // Mental models & decision-making
            { url: "https://nav.al/feed/", name: "Naval Ravikant" }, // Startup wisdom, philosophy, and wealth
        ],
        ai: [
            { url: "https://openai.com/research/rss.xml", name: "OpenAI Research" }, // Cutting-edge AI
            { url: "http://karpathy.github.io/feed.xml", name: "Andrej Karpathy’s Blog" }, // Deep learning & AI insights
            { url: "https://www.alignmentforum.org/feed.xml", name: "AI Alignment Forum" }, // AI safety & long-term AI risks
        ],
        art: [
            { url: "https://www.thisiscolossal.com/feed/", name: "Colossal Art" }, // The best in modern art
        ],
        music: [
            { url: "https://mixmag.net/rss.xml", name: "Mixmag" }, // Techno and underground music
            { url: "https://www.synthtopia.com/feed/", name: "Synthtopia" }, // The best for synth nerds
            { url: "https://xlr8r.com/feed/", name: "XLR8R" } // Experimental electronic music
        ]
    };


    // 🔹 Fetch RSS Feed with Improved Debugging
    async function fetchFeed(url) {
        try {
            console.log(`📡 Fetching: ${url}`);
            const response = await fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);
            if (!response.ok) throw new Error(`🚨 HTTP ${response.status} - Failed to fetch: ${url}`);

            const data = await response.json();  // Convert response to JSON
            const text = data.contents; // Extract actual RSS feed content

            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "application/xml");

            if (xml.querySelector("parsererror")) {
                throw new Error("❌ Failed to parse XML.");
            }

            const items = xml.querySelectorAll("item");
            if (items.length === 0) {
                console.warn("⚠ No articles found in this feed:", url);
            }

            return Array.from(items).map(item => ({
                title: item.querySelector("title")?.textContent || "No Title",
                link: item.querySelector("link")?.textContent || "#",
                description: item.querySelector("description")?.textContent || "No Description",
                pubDate: item.querySelector("pubDate")?.textContent || new Date().toISOString()
            }));
        } catch (error) {
            console.error("🛑 Fetch Error:", error);
            return [];  // Return empty array so script doesn't break
        }
    }

    // 🔹 Fetch & Render Feeds with Optimized Performance
    async function fetchAllFeeds(category = "tech") {
        articlesContainer.innerHTML = "<p>Loading RJX7's feeds... 🔄</p>";

        let allArticles = [];
        const categoryFeeds = category === "all"
            ? Object.values(feeds).flat()
            : feeds[category] || [];

        const fetchPromises = categoryFeeds.map(feed => fetchFeed(feed.url));
        const articlesArray = await Promise.all(fetchPromises);

        articlesArray.forEach((articles, index) => {
            const feedName = categoryFeeds[index].name;
            allArticles.push(...articles.map(article => ({
                ...article,
                category,
                feedName
            })));
        });

        if (allArticles.length === 0) {
            console.warn("⚠ No articles found. Check RSS URLs or CORS proxy.");
            articlesContainer.innerHTML = "<p>No articles available. Try refreshing.</p>";
            return;
        }

        // 🔹 Cache articles in localStorage
        localStorage.setItem("cachedArticles", JSON.stringify(allArticles));

        renderArticles(allArticles);
    }

    // 🔹 Render Articles with Lazy Loading
    function renderArticles(articles) {
        articlesContainer.innerHTML = articles.map(article => `
            <a href="${article.link}" target="_blank" class="article-card">
                <div class="article-content">
                    <h3>${article.title}</h3>
                    <div class="article-meta">
                        <span>${new Date(article.pubDate).toLocaleDateString()}</span>
                        <span class="article-category">${article.category}</span>
                    </div>
                </div>
            </a>
        `).join("");
    }



    // 🔹 Load Cached Articles for Instant Loading
    function loadCachedArticles() {
        const cachedData = localStorage.getItem("cachedArticles");
        if (cachedData) {
            console.log("⚡ Loading cached articles...");
            renderArticles(JSON.parse(cachedData));
        } else {
            fetchAllFeeds();
        }
    }

    // 🔹 Dark Mode Toggle with Persistence
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
    });

    if (localStorage.getItem("darkMode") === "true") {
        document.body.classList.add("dark-mode");
    }

    // 🔹 Event Listeners
    refreshButton.addEventListener("click", () => fetchAllFeeds(categoryFilter.value));
    categoryFilter.addEventListener("change", (e) => fetchAllFeeds(e.target.value));

    // 🔹 Load Cached Articles on Startup
    loadCachedArticles();
});
