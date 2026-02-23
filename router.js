// Client-side router for Coffeeclub.in
class Router {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/home': 'index.html',
            '/blogs': 'blog.html',
            '/blogs/art-and-science-of-coffee-brewing': 'blog/art-and-science-of-coffee-brewing.html',
            '/blogs/moka-pot-vs-aeropress': 'blog/moka-pot-vs-aeropress.html',
            '/blogs/araku-valley-spotlight': 'blog/araku-valley-spotlight.html',
            '/blogs/timing-caffeine-for-engineers': 'blog/timing-caffeine-for-engineers.html',
            '/tools': 'tools.html',
            '/tools/calculator': 'tools/calculator.html',
            '/tools/quiz': 'tools/quiz.html'
        };
        
        this.init();
    }

    init() {
        // Intercept all link clicks using event delegation
        // This works for both static and dynamically loaded content
        document.addEventListener('click', (e) => {
            // Find the closest anchor tag (handles nested elements like <h3><a>)
            const link = e.target.closest('a');
            if (!link) {
                return;
            }

            console.log('Link clicked:', link.href, 'data-route:', link.getAttribute('data-route'));

            // Check for data-route attribute first
            const dataRoute = link.getAttribute('data-route');
            if (dataRoute) {
                e.preventDefault();
                e.stopPropagation();
                const href = link.getAttribute('href') || '';
                const hash = href.includes('#') ? '#' + href.split('#')[1] : '';
                const fullRoute = dataRoute + hash;
                console.log('Navigating via data-route:', fullRoute);
                this.navigate(fullRoute);
                return false;
            }

            const href = link.getAttribute('href');
            if (!href) {
                return;
            }
            
            // Skip external links, mailto, tel, etc.
            if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                return;
            }
            
            // Check if it's a route we handle
            const route = this.getRouteFromHref(href);
            if (route !== null) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Navigating via href:', route);
                this.navigate(route);
                return false;
            } else {
                console.log('Route not found for href:', href);
            }
        }, true); // Use capture phase to catch events early

        // Handle initial load
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', () => {
                // Only handle route if we're not on the home page
                const path = window.location.pathname;
                const route = path.endsWith('/') ? path.slice(0, -1) || '/' : path;
                if (route !== '/' && route !== '' && route !== '/index.html') {
                    this.handleRoute();
                }
            });
        } else {
            // DOM already loaded
            const path = window.location.pathname;
            const route = path.endsWith('/') ? path.slice(0, -1) || '/' : path;
            if (route !== '/' && route !== '' && route !== '/index.html') {
                this.handleRoute();
            }
        }

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            this.handleRoute();
        });
    }

    getRouteFromHref(href) {
        if (!href) return null;
        
        // Remove hash fragments for route matching
        let route = href.split('#')[0];
        
        // If it already starts with /, it's already a route
        if (route.startsWith('/')) {
            // Remove trailing slash
            route = route.endsWith('/') ? route.slice(0, -1) || '/' : route;
            // Check if it's in our routes
            if (this.routes.hasOwnProperty(route)) {
                return route;
            }
            // Handle /blogs/ and /tools/ patterns
            if (route.startsWith('/blogs/')) {
                return route; // Already in correct format
            }
            if (route.startsWith('/tools/')) {
                return route; // Already in correct format
            }
            return null;
        }
        
        // Remove leading ./, ../, and trailing .html
        route = route.replace(/^\.\.?\//, '').replace(/\.html$/, '');
        
        // Convert file paths to routes
        if (route === 'index' || route === '') {
            return '/';
        }
        
        // Check if it matches any of our routes
        if (this.routes.hasOwnProperty('/' + route)) {
            return '/' + route;
        }
        
        // Handle blog posts
        if (route.startsWith('blog/')) {
            const blogSlug = route.replace('blog/', '');
            return '/blogs/' + blogSlug;
        }
        
        // Handle tools
        if (route.startsWith('tools/')) {
            const toolSlug = route.replace('tools/', '');
            return '/tools/' + toolSlug;
        }
        
        // Direct route matches
        if (route === 'blog') return '/blogs';
        if (route === 'tools') return '/tools';
        
        return null;
    }

    navigate(path) {
        // Handle hash fragments
        const parts = path.split('#');
        const route = parts[0];
        const hash = parts[1] ? '#' + parts[1] : '';
        
        // Update URL without reload
        window.history.pushState({}, '', route + hash);
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        const route = path.endsWith('/') ? path.slice(0, -1) || '/' : path;
        
        // Handle hash fragments
        const hash = window.location.hash;
        
        console.log('Handling route:', route, 'hash:', hash);
        console.log('Checking routes object:', this.routes);
        console.log('Route exists?', route in this.routes);
        
        const filePath = this.routes[route];
        
        if (!filePath) {
            // Try to find a close match or show 404
            console.error('Route not found:', route);
            console.error('Available routes:', Object.keys(this.routes));
            console.error('Route type:', typeof route, 'Route value:', JSON.stringify(route));
            
            // For root path or index, show home content
            if (route === '/' || route === '' || route === '/index.html') {
                // Don't load content, just show what's already there
                console.log('On home page, not loading content');
                return;
            }
            // Fallback to home - ensure we load from root, not current directory
            console.log('Falling back to home page');
            // Use absolute path from root - remove leading slash for fetch
            await this.loadContent('/index.html', hash);
            return;
        }

        console.log('Found route, loading:', filePath);
        await this.loadContent(filePath, hash);
    }

    async loadContent(filePath, hash = '') {
        try {
            // Ensure filePath is always relative to root (not current directory)
            // fetch() with a path starting with / resolves relative to origin root
            // fetch() with a relative path resolves relative to current page URL
            // So we need to ensure paths always start with / for root-relative loading
            let normalizedPath = filePath;
            
            // If it doesn't start with / and it's not a full URL, make it root-relative
            if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('http')) {
                normalizedPath = '/' + normalizedPath;
            }
            
            console.log('Loading content from:', normalizedPath, '(original:', filePath, ', current URL:', window.location.pathname + ')');
            const response = await fetch(normalizedPath);
            if (!response.ok) {
                throw new Error(`Failed to load ${normalizedPath}: ${response.status} ${response.statusText}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract main content (skip head, body wrapper)
            const body = doc.body;
            
            // Update page title
            const title = doc.querySelector('title');
            if (title) {
                document.title = title.textContent;
            }
            
            // Update meta description
            const metaDesc = doc.querySelector('meta[name="description"]');
            if (metaDesc) {
                const existingMeta = document.querySelector('meta[name="description"]');
                if (existingMeta) {
                    existingMeta.setAttribute('content', metaDesc.getAttribute('content'));
                }
            }
            
            // Extract only the main content (skip header and footer which are already in index.html)
            let contentToLoad = '';
            const mainContent = body.querySelector('main, .blog-page, .tools-page, .blog-post, article');
            
            if (mainContent) {
                contentToLoad = mainContent.outerHTML;
            } else {
                // Fallback: use body content but remove header and footer
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = body.innerHTML;
                
                // Remove header and footer if they exist
                const header = tempDiv.querySelector('header');
                const footer = tempDiv.querySelector('footer');
                if (header) header.remove();
                if (footer) footer.remove();
                
                contentToLoad = tempDiv.innerHTML;
            }
            
            // Fix relative paths in loaded content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentToLoad;
            
            // Fix image src paths - convert relative paths to absolute from root
            // When content is loaded from blog/article.html into root index.html,
            // paths like ../images/blog/photo.png need to become /images/blog/photo.png
            const images = tempDiv.querySelectorAll('img');
            images.forEach(img => {
                let src = img.getAttribute('src');
                if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                    const originalSrc = src;
                    
                    // Remove all ../ prefixes - we're loading into root, so everything is relative to root
                    while (src.startsWith('../')) {
                        src = src.replace(/^\.\.\//, '');
                    }
                    
                    // Fix file extension if it's .jpg but should be .png (for the blog images)
                    if (src.includes('images/blog/') && src.endsWith('.jpg')) {
                        src = src.replace(/\.jpg$/, '.png');
                        console.log('Changed extension from .jpg to .png:', originalSrc, '->', src);
                    }
                    
                    // Ensure path starts with / for root-relative paths
                    if (!src.startsWith('/')) {
                        src = '/' + src;
                    }
                    
                    console.log('Fixed image path:', originalSrc, '->', src);
                    img.setAttribute('src', src);
                }
            });
            
            // Fix link hrefs in loaded content
            const links = tempDiv.querySelectorAll('a[href]');
            links.forEach(link => {
                let href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
                    // Convert to route-style if it's a local link
                    const route = this.getRouteFromHref(href);
                    if (route !== null) {
                        link.setAttribute('href', route);
                        link.setAttribute('data-route', route);
                    }
                }
            });
            
            // Replace main content area
            const app = document.getElementById('app');
            if (app) {
                app.innerHTML = tempDiv.innerHTML;
                
                console.log('Content loaded successfully into #app');
                
                // Re-initialize scripts
                this.reinitializeScripts();
                
                // Verify links in loaded content have data-route attributes
                const loadedLinks = app.querySelectorAll('a[href]');
                console.log(`Found ${loadedLinks.length} links in loaded content`);
                loadedLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    const dataRoute = link.getAttribute('data-route');
                    if (href && !dataRoute && !href.startsWith('#') && !href.startsWith('http')) {
                        // Try to add data-route if missing
                        const route = this.getRouteFromHref(href);
                        if (route) {
                            link.setAttribute('data-route', route);
                            console.log('Added data-route to link:', href, '->', route);
                        }
                    }
                });
                
                // Handle hash navigation
                if (hash) {
                    setTimeout(() => {
                        const element = document.querySelector(hash);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 100);
                } else {
                    window.scrollTo(0, 0);
                }
            } else {
                console.error('App container (#app) not found in DOM');
            }
        } catch (error) {
            console.error('Error loading content:', error);
            // Fallback to index - use absolute path from root
            if (filePath !== 'index.html' && filePath !== '/index.html') {
                console.log('Falling back to home page due to error');
                // Don't recursively call if we're already trying to load index
                const currentPath = window.location.pathname;
                if (currentPath !== '/' && currentPath !== '/index.html') {
                    // Navigate to home instead of trying to load
                    window.history.pushState({}, '', '/');
                    // Just show the home content that's already loaded
                    return;
                }
            }
        }
    }

    reinitializeScripts() {
        // Re-run any initialization scripts
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
        
        // Re-attach newsletter handlers
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => {
            form.onsubmit = handleNewsletter;
        });
    }
}

// Initialize router
console.log('Initializing Coffeeclub router...');
const router = new Router();
console.log('Router initialized. Available routes:', Object.keys(router.routes));

