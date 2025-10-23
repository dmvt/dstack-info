// Documentation Rendering System for dstack.info
// Fetches and renders markdown from GitHub dstack-TEE/dstack repo

class DstackDocs {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/Dstack-TEE/dstack/contents';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.docs = [
            { title: 'Overview', path: 'README.md', category: 'Getting Started' },
            { title: 'Deployment Guide', path: 'docs/deployment.md', category: 'Guides' },
            { title: 'VMM CLI User Guide', path: 'docs/vmm-cli-user-guide.md', category: 'Guides' },
            { title: 'Security Guide', path: 'docs/security-guide/security-guide.md', category: 'Security' },
            { title: 'Attestation', path: 'attestation.md', category: 'Security' },
            { title: 'Contributing', path: 'CONTRIBUTING.md', category: 'Community' },
            { title: 'Code of Conduct', path: 'CODE_OF_CONDUCT.md', category: 'Community' }
        ];
    }

    async fetchMarkdown(path) {
        // Check cache first
        const cached = this.cache.get(path);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.content;
        }

        try {
            const response = await fetch(`${this.baseUrl}/${path}`);
            if (!response.ok) throw new Error(`Failed to fetch ${path}`);

            const data = await response.json();
            const content = atob(data.content); // Decode base64

            // Cache the content
            this.cache.set(path, {
                content,
                timestamp: Date.now()
            });

            return content;
        } catch (error) {
            console.error(`Error fetching ${path}:`, error);
            return `# Error Loading Documentation\n\nCould not load documentation from GitHub. Please visit the [GitHub repository](https://github.com/Dstack-TEE/dstack) directly.\n\n**Error:** ${error.message}`;
        }
    }

    removePhalaBranding(markdown) {
        // Remove Phala Network references
        markdown = markdown.replace(/Phala Network/gi, 'dstack');
        markdown = markdown.replace(/Phala Cloud/gi, 'dstack managed service');
        markdown = markdown.replace(/phala\.com/gi, 'dstack.info');
        markdown = markdown.replace(/docs\.phala\.com\/dstack/gi, 'dstack.info/docs');

        // Remove Intel references
        markdown = markdown.replace(/Intel TDX/gi, 'TEE hardware');
        markdown = markdown.replace(/Intel/gi, 'TEE');

        return markdown;
    }

    processMarkdown(markdown) {
        // Remove Phala branding
        markdown = this.removePhalaBranding(markdown);

        // Fix image paths to use GitHub raw content
        markdown = markdown.replace(
            /!\[(.*?)\]\((?!http)(.*?)\)/g,
            (match, alt, path) => {
                const cleanPath = path.startsWith('./') ? path.slice(2) : path;
                return `![${alt}](https://raw.githubusercontent.com/Dstack-TEE/dstack/main/${cleanPath})`;
            }
        );

        // Fix relative links to point to GitHub
        markdown = markdown.replace(
            /\[([^\]]+)\]\((?!http|#)(.*?)\)/g,
            (match, text, path) => {
                return `[${text}](https://github.com/Dstack-TEE/dstack/blob/main/${path})`;
            }
        );

        return markdown;
    }

    async renderDoc(path, targetElement) {
        const loadingHTML = '<div class="doc-loading">Loading documentation...</div>';
        targetElement.innerHTML = loadingHTML;

        try {
            let markdown = await this.fetchMarkdown(path);
            markdown = this.processMarkdown(markdown);

            // Render markdown using marked.js
            const html = marked.parse(markdown);
            targetElement.innerHTML = html;

            // Syntax highlighting
            targetElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // Add anchor links to headings
            targetElement.querySelectorAll('h2, h3, h4').forEach((heading) => {
                const id = heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
                heading.id = id;
                heading.innerHTML = `<a href="#${id}" class="heading-anchor">${heading.textContent}</a>`;
            });

        } catch (error) {
            targetElement.innerHTML = `<div class="doc-error">Error loading documentation: ${error.message}</div>`;
        }
    }

    buildSidebar() {
        const categories = {};

        // Group docs by category
        this.docs.forEach(doc => {
            if (!categories[doc.category]) {
                categories[doc.category] = [];
            }
            categories[doc.category].push(doc);
        });

        // Build HTML
        let html = '<div class="docs-sidebar">';

        Object.keys(categories).forEach(category => {
            html += `<div class="docs-category">`;
            html += `<h3>${category}</h3>`;
            html += '<ul>';

            categories[category].forEach(doc => {
                const slug = doc.path.replace(/\//g, '-').replace('.md', '');
                html += `<li><a href="#doc-${slug}" data-path="${doc.path}">${doc.title}</a></li>`;
            });

            html += '</ul></div>';
        });

        html += '</div>';
        return html;
    }

    init(sidebarElement, contentElement) {
        // Build and inject sidebar
        sidebarElement.innerHTML = this.buildSidebar();

        // Handle sidebar clicks
        sidebarElement.querySelectorAll('a[data-path]').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const path = link.getAttribute('data-path');

                // Update active state
                sidebarElement.querySelectorAll('a').forEach(a => a.classList.remove('active'));
                link.classList.add('active');

                // Render doc
                await this.renderDoc(path, contentElement);

                // Scroll to top
                contentElement.scrollTop = 0;
            });
        });

        // Load first doc by default
        const firstDoc = this.docs[0];
        this.renderDoc(firstDoc.path, contentElement);
        sidebarElement.querySelector(`a[data-path="${firstDoc.path}"]`).classList.add('active');
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.DstackDocs = DstackDocs;
}
