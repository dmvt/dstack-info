// Documentation Rendering System for dstack.info
// Fetches and renders markdown from GitHub dstack-TEE/dstack repo

class DstackDocs {
    constructor() {
        this.baseUrl = 'https://api.github.com/repos/Dstack-TEE/dstack/contents';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.docs = [
            // Getting Started
            { title: 'Overview', path: 'README.md', category: 'Getting Started' },
            { title: 'FAQ', path: 'docs/faq.md', category: 'Getting Started' },
            { title: 'Glossary', path: 'GLOSSARY.md', category: 'Getting Started' },

            // Guides & Tutorials
            { title: 'Complete Deployment Guide', path: 'docs/deployment.md', category: 'Guides & Tutorials' },
            { title: 'VMM CLI User Guide', path: 'docs/vmm-cli-user-guide.md', category: 'Guides & Tutorials' },
            { title: 'Gateway Production Setup', path: 'docs/dstack-gateway.md', category: 'Guides & Tutorials' },
            { title: 'Normalized App Compose', path: 'docs/normalized-app-compose.md', category: 'Guides & Tutorials' },

            // Security
            { title: 'Security Best Practices', path: 'docs/security-guide/security-guide.md', category: 'Security' },
            { title: 'Security Boundaries (CVM)', path: 'docs/security-guide/cvm-boundaries.md', category: 'Security' },
            { title: 'Attestation & Verification', path: 'attestation.md', category: 'Security' },
            { title: 'Design & Hardening Decisions', path: 'docs/design-and-hardening-decisions.md', category: 'Security' },

            // SDK Documentation
            { title: 'SDK Overview', path: 'sdk/README.md', category: 'SDK Documentation' },
            { title: 'Rust SDK', path: 'sdk/rust/README.md', category: 'SDK Documentation' },
            { title: 'Python SDK', path: 'sdk/python/README.md', category: 'SDK Documentation' },
            { title: 'Go SDK', path: 'sdk/go/README.md', category: 'SDK Documentation' },
            { title: 'JavaScript SDK', path: 'sdk/js/README.md', category: 'SDK Documentation' },

            // API Reference
            { title: 'REST API Reference', path: 'sdk/curl/api.md', category: 'API Reference' },
            { title: 'Legacy Tappd API', path: 'sdk/curl/api-tappd.md', category: 'API Reference' },

            // Architecture
            { title: 'System Architecture', path: 'CLAUDE.md', category: 'Architecture' },
            { title: 'KMS Protocol', path: 'kms/README.md', category: 'Architecture' },

            // Community
            { title: 'Community Calls', path: 'COMMUNITY-CALLS.md', category: 'Community' },
            { title: 'Contributing Guide', path: 'CONTRIBUTING.md', category: 'Community' },
            { title: 'Code of Conduct', path: 'CODE_OF_CONDUCT.md', category: 'Community' },
            { title: 'Changelog', path: 'CHANGELOG.md', category: 'Community' },

            // Resources & Articles
            { title: 'Blog Posts & Articles', path: 'BLOG_POSTS.md', category: 'Resources & Articles' }
        ];
    }

    async fetchMarkdown(path) {
        // Check cache first
        const cached = this.cache.get(path);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.content;
        }

        try {
            // Check if this is a local file (blog posts, changelog content, glossary, community calls, etc.)
            const localFiles = ['BLOG_POSTS.md', 'CHANGELOG-CONTENT.md', 'GLOSSARY.md', 'COMMUNITY-CALLS.md'];
            if (localFiles.includes(path)) {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Failed to fetch local file ${path}`);
                const content = await response.text();

                // Cache the content
                this.cache.set(path, {
                    content,
                    timestamp: Date.now()
                });

                return content;
            }

            // Fetch from GitHub
            const response = await fetch(`${this.baseUrl}/${path}`);
            if (!response.ok) throw new Error(`Failed to fetch ${path}`);

            const data = await response.json();

            // Decode base64 with proper UTF-8 handling for emojis and special characters
            const binaryString = atob(data.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const content = new TextDecoder('utf-8').decode(bytes);

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

    processMarkdown(markdown, path) {
        // Remove Phala branding (except for blog posts which are about Phala)
        if (path !== 'BLOG_POSTS.md') {
            markdown = this.removePhalaBranding(markdown);
        }

        // Get the directory of the current file for resolving relative paths
        const fileDir = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : '';

        // Fix markdown image paths to use GitHub raw content
        markdown = markdown.replace(
            /!\[(.*?)\]\((?!http)(.*?)\)/g,
            (match, alt, imgPath) => {
                let cleanPath = imgPath.startsWith('./') ? imgPath.slice(2) : imgPath;
                // If the image path is relative and we have a file directory, prepend it
                if (!cleanPath.startsWith('/') && fileDir && !cleanPath.startsWith('docs/')) {
                    cleanPath = `${fileDir}/${cleanPath}`;
                }
                return `![${alt}](https://raw.githubusercontent.com/Dstack-TEE/dstack/master/${cleanPath})`;
            }
        );

        // Fix HTML img tag src attributes to use GitHub raw content
        markdown = markdown.replace(
            /<img([^>]*?)src=["'](?!http)(.*?)["']/g,
            (match, beforeSrc, imgPath) => {
                let cleanPath = imgPath.startsWith('./') ? imgPath.slice(2) : imgPath;
                // If the image path is relative and we have a file directory, prepend it
                if (!cleanPath.startsWith('/') && fileDir && !cleanPath.startsWith('docs/')) {
                    cleanPath = `${fileDir}/${cleanPath}`;
                }
                return `<img${beforeSrc}src="https://raw.githubusercontent.com/Dstack-TEE/dstack/master/${cleanPath}"`;
            }
        );

        // Fix relative links to point to GitHub
        markdown = markdown.replace(
            /\[([^\]]+)\]\((?!http|#)(.*?)\)/g,
            (match, text, linkPath) => {
                return `[${text}](https://github.com/Dstack-TEE/dstack/blob/master/${linkPath})`;
            }
        );

        return markdown;
    }

    async renderDoc(path, targetElement) {
        const loadingHTML = '<div class="doc-loading">Loading documentation...</div>';
        targetElement.innerHTML = loadingHTML;

        try {
            let markdown = await this.fetchMarkdown(path);
            markdown = this.processMarkdown(markdown, path);

            // Find the document info for breadcrumbs
            const docInfo = this.docs.find(doc => doc.path === path);

            // Render markdown using marked.js
            const html = marked.parse(markdown);

            // Add breadcrumbs
            const breadcrumbHTML = docInfo ? `
                <div class="breadcrumbs">
                    <a href="index.html"><i class="fa-solid fa-home"></i> Home</a>
                    <i class="fa-solid fa-chevron-right"></i>
                    <a href="docs.html">Documentation</a>
                    <i class="fa-solid fa-chevron-right"></i>
                    <span>${docInfo.category}</span>
                    <i class="fa-solid fa-chevron-right"></i>
                    <span class="current">${docInfo.title}</span>
                </div>
            ` : '';

            targetElement.innerHTML = breadcrumbHTML + html;

            // Syntax highlighting and copy buttons
            targetElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);

                // Add copy button to pre element
                const pre = block.parentElement;
                if (!pre.querySelector('.copy-button')) {
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
                    copyButton.title = 'Copy code';
                    copyButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(block.textContent).then(() => {
                            copyButton.innerHTML = '<i class="fa-solid fa-check"></i>';
                            copyButton.classList.add('copied');
                            setTimeout(() => {
                                copyButton.innerHTML = '<i class="fa-solid fa-copy"></i>';
                                copyButton.classList.remove('copied');
                            }, 2000);
                        });
                    });
                    pre.style.position = 'relative';
                    pre.appendChild(copyButton);
                }
            });

            // Add anchor links to headings (but preserve external links in blog posts)
            targetElement.querySelectorAll('h2, h3, h4').forEach((heading) => {
                // Check if heading already contains an external link
                const existingLink = heading.querySelector('a[href^="http"]');

                if (existingLink) {
                    // Preserve external link and make it open in new tab
                    existingLink.setAttribute('target', '_blank');
                    existingLink.setAttribute('rel', 'noopener noreferrer');
                } else {
                    // Add anchor link for internal navigation
                    const id = heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
                    heading.id = id;
                    heading.innerHTML = `<a href="#${id}" class="heading-anchor">${heading.textContent}</a>`;
                }
            });

            // Generate and inject table of contents
            const toc = generateTableOfContents(targetElement);
            if (toc) {
                const firstHeading = targetElement.querySelector('h1, h2');
                if (firstHeading) {
                    firstHeading.insertAdjacentHTML('afterend', toc);
                }
            }

            // Add related docs
            if (docInfo) {
                const relatedDocs = this.getRelatedDocs(docInfo);
                if (relatedDocs.length > 0) {
                    let relatedHTML = '<div class="related-docs"><h3>Related Documentation</h3><ul class="related-list">';
                    relatedDocs.forEach(doc => {
                        const slug = doc.path.replace(/\//g, '-').replace('.md', '');
                        relatedHTML += `<li><a href="#doc-${slug}" data-path="${doc.path}"><i class="fa-solid fa-file-lines"></i> ${doc.title}</a><span class="doc-category">${doc.category}</span></li>`;
                    });
                    relatedHTML += '</ul></div>';
                    targetElement.insertAdjacentHTML('beforeend', relatedHTML);

                    // Add click handlers for related docs
                    targetElement.querySelectorAll('.related-docs a[data-path]').forEach(link => {
                        link.addEventListener('click', async (e) => {
                            e.preventDefault();
                            const relatedPath = link.getAttribute('data-path');
                            await this.renderDoc(relatedPath, targetElement);
                            targetElement.scrollTop = 0;

                            // Update sidebar active state
                            document.querySelectorAll('.docs-sidebar a').forEach(a => a.classList.remove('active'));
                            const sidebarLink = document.querySelector(`.docs-sidebar a[data-path="${relatedPath}"]`);
                            if (sidebarLink) sidebarLink.classList.add('active');
                        });
                    });
                }
            }

            // Add edit on GitHub link (only for GitHub-hosted files)
            const localFiles = ['BLOG_POSTS.md', 'CHANGELOG-CONTENT.md', 'GLOSSARY.md', 'COMMUNITY-CALLS.md'];
            if (!localFiles.includes(path)) {
                const editLink = `<div class="doc-meta"><a href="https://github.com/Dstack-TEE/dstack/edit/main/${path}" target="_blank" class="edit-link"><i class="fa-brands fa-github"></i> Edit on GitHub</a></div>`;
                targetElement.insertAdjacentHTML('beforeend', editLink);
            }

        } catch (error) {
            targetElement.innerHTML = `<div class="doc-error">Error loading documentation: ${error.message}</div>`;
        }
    }

    getRelatedDocs(currentDoc) {
        // Find docs in the same category, excluding current doc
        const sameCategoryDocs = this.docs.filter(doc =>
            doc.category === currentDoc.category && doc.path !== currentDoc.path
        );

        // Shuffle and take up to 3
        const shuffled = sameCategoryDocs.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
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

        // Build HTML with search and collapsible categories
        let html = '<div class="docs-sidebar">';

        // Add search box
        html += `<div class="docs-search">
            <input type="text" id="doc-search" placeholder="Search documentation..." autocomplete="off">
            <i class="fa-solid fa-search search-icon"></i>
        </div>`;

        Object.keys(categories).forEach((category, index) => {
            const categoryId = category.toLowerCase().replace(/\s+/g, '-');
            const isExpanded = index === 0; // First category expanded by default

            html += `<div class="docs-category" data-category="${categoryId}">`;
            html += `<h3 class="category-header ${isExpanded ? 'expanded' : ''}" onclick="toggleCategory('${categoryId}')">`;
            html += `<i class="fa-solid fa-chevron-right category-icon"></i>`;
            html += `${category}`;
            html += `<span class="doc-count">(${categories[category].length})</span>`;
            html += `</h3>`;
            html += `<ul class="category-docs ${isExpanded ? 'expanded' : ''}">`;

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

        // Setup search functionality
        const searchInput = sidebarElement.querySelector('#doc-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                this.filterDocs(query, sidebarElement);
            });
        }

        // Load first doc by default
        const firstDoc = this.docs[0];
        this.renderDoc(firstDoc.path, contentElement);
        sidebarElement.querySelector(`a[data-path="${firstDoc.path}"]`).classList.add('active');
    }

    filterDocs(query, sidebarElement) {
        const categories = sidebarElement.querySelectorAll('.docs-category');

        if (!query) {
            // Show all
            categories.forEach(cat => {
                cat.style.display = 'block';
                cat.querySelectorAll('li').forEach(li => li.style.display = 'block');
            });
            return;
        }

        // Filter
        categories.forEach(cat => {
            const links = cat.querySelectorAll('a[data-path]');
            let hasVisibleDocs = false;

            links.forEach(link => {
                const title = link.textContent.toLowerCase();
                const parent = link.closest('li');

                if (title.includes(query)) {
                    parent.style.display = 'block';
                    hasVisibleDocs = true;
                } else {
                    parent.style.display = 'none';
                }
            });

            // Show/hide category based on if it has visible docs
            if (hasVisibleDocs) {
                cat.style.display = 'block';
                // Expand category when searching
                const header = cat.querySelector('.category-header');
                const docs = cat.querySelector('.category-docs');
                if (header && docs) {
                    header.classList.add('expanded');
                    docs.classList.add('expanded');
                }
            } else {
                cat.style.display = 'none';
            }
        });
    }
}

// Category toggle function
function toggleCategory(categoryId) {
    const category = document.querySelector(`[data-category="${categoryId}"]`);
    if (!category) return;

    const header = category.querySelector('.category-header');
    const docs = category.querySelector('.category-docs');

    header.classList.toggle('expanded');
    docs.classList.toggle('expanded');
}

// Generate table of contents from headings
function generateTableOfContents(contentElement) {
    const headings = contentElement.querySelectorAll('h2, h3');
    if (headings.length < 3) return ''; // Don't show TOC for short pages

    let tocHTML = '<div class="table-of-contents"><div class="toc-header">On This Page</div><ul class="toc-list">';
    let validHeadings = 0;

    headings.forEach((heading) => {
        const level = heading.tagName.toLowerCase();
        const id = heading.id;
        const text = heading.textContent;
        const className = level === 'h3' ? 'toc-sub' : '';

        // Skip headings without IDs (they have external links)
        if (!id) return;

        validHeadings++;
        tocHTML += `<li class="${className}"><a href="#${id}">${text}</a></li>`;
    });

    tocHTML += '</ul></div>';

    // Don't show TOC if we don't have enough valid internal headings
    return validHeadings >= 3 ? tocHTML : '';
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.DstackDocs = DstackDocs;
    window.toggleCategory = toggleCategory;
    window.generateTableOfContents = generateTableOfContents;
}
