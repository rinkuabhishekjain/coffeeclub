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

        // Handle initial load - always check route on page load
        const initRoute = () => {
            // Small delay to ensure DOM is fully ready
            setTimeout(() => {
                this.handleRoute();
            }, 10);
        };
        
        if (document.readyState === 'loading') {
            window.addEventListener('DOMContentLoaded', initRoute);
        } else {
            // DOM already loaded - handle route immediately
            initRoute();
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
        console.log('Available routes:', Object.keys(this.routes));
        console.log('Route exists?', route in this.routes);
        console.log('Route lookup:', this.routes[route]);
        
        const filePath = this.routes[route];
        
        if (!filePath) {
            // Try to find a close match or show 404
            console.error('Route not found:', route);
            console.error('Route type:', typeof route, 'Route value:', JSON.stringify(route));
            
            // For root path or index, show home content (don't reload)
            if (route === '/' || route === '' || route === '/index.html') {
                // Don't load content, just show what's already there
                console.log('On home page, not loading content');
                return;
            }
            // Don't fallback to home - show error or keep current content
            console.error('Route not found, keeping current content');
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
            
            let html = await response.text();
            console.log('Fetched HTML, length:', html.length);
            
            // Check if this is a tool page (calculator or quiz) - we need to preserve scripts and styles for these
            const isToolPage = filePath.includes('calculator') || filePath.includes('quiz');
            let extractedScripts = [];
            let externalScripts = [];
            let extractedStyles = [];
            
            if (isToolPage) {
                // Extract style tags from head
                const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
                if (styleMatches) {
                    styleMatches.forEach(match => {
                        const contentMatch = match.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                        if (contentMatch && contentMatch[1].trim()) {
                            extractedStyles.push(contentMatch[1]);
                        }
                    });
                }
                console.log('Extracted', extractedStyles.length, 'style blocks for tool page');
                
                // Extract inline scripts before removing them
                const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
                if (scriptMatches) {
                    scriptMatches.forEach(match => {
                        // Skip Google Analytics scripts
                        if (!match.includes('gtag') && !match.includes('googletagmanager')) {
                            // Extract script content (between > and <)
                            const contentMatch = match.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                            if (contentMatch && contentMatch[1].trim()) {
                                extractedScripts.push(contentMatch[1]);
                            }
                            // Check for external scripts
                            const srcMatch = match.match(/src=["']([^"']+)["']/i);
                            if (srcMatch && srcMatch[1]) {
                                let src = srcMatch[1];
                                // Skip script.js (already loaded in index.html)
                                if (src.includes('script.js')) {
                                    console.log('Skipping script.js (already loaded)');
                                } else {
                                    // Fix relative paths
                                    if (src.startsWith('../')) {
                                        src = src.replace(/^\.\.\//, '/');
                                    } else if (src.startsWith('./')) {
                                        src = src.replace(/^\.\//, '/');
                                    } else if (!src.startsWith('/') && !src.startsWith('http')) {
                                        // If it's a relative path like "quiz.js", make it absolute based on filePath
                                        if (filePath.includes('tools/')) {
                                            src = '/tools/' + src;
                                        } else {
                                            src = '/' + src;
                                        }
                                    }
                                    externalScripts.push(src);
                                }
                            }
                        }
                    });
                }
                console.log('Extracted', extractedScripts.length, 'inline scripts and', externalScripts.length, 'external scripts for tool page');
            }
            
            // Remove script tags and style tags (we've extracted them for tool pages) and fix relative paths in HTML string BEFORE parsing
            // This prevents browser from trying to load resources with wrong paths
            html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            html = html.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
            // Remove style tags (we extract them for tool pages, but remove from HTML to avoid duplication)
            if (isToolPage) {
                html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
            }
            
            // Fix relative image paths in HTML string (../images -> /images)
            html = html.replace(/src="\.\.\/images\//g, 'src="/images/');
            html = html.replace(/src='\.\.\/images\//g, "src='/images/");
            html = html.replace(/href="\.\.\/images\//g, 'href="/images/');
            html = html.replace(/href='\.\.\/images\//g, "href='/images/");
            
            console.log('HTML after cleanup, length:', html.length);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract main content (skip head, body wrapper)
            const body = doc.body;
            console.log('Parsed body, looking for content...');
            
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
            
            // Remove header and footer from body FIRST (before any extraction)
            const header = body.querySelector('header');
            const footer = body.querySelector('footer');
            if (header) {
                console.log('Removing header from body');
                header.remove();
            }
            if (footer) {
                console.log('Removing footer from body');
                footer.remove();
            }
            
            // Remove all script tags from body
            const bodyScripts = body.querySelectorAll('script');
            bodyScripts.forEach(script => {
                console.log('Removing script from body:', script.getAttribute('src') || 'inline');
                script.remove();
            });
            
            // Extract only the main content (skip header and footer which are already in index.html)
            let contentToLoad = '';
            
            // Try to find the main content area
            // For blog listing pages, prioritize main/.blog-page over article elements
            // For individual blog posts, prioritize article.blog-post
            let mainContent = null;
            
            // First check if this is a blog listing or tools page (has main element)
            mainContent = body.querySelector('main.blog-page, main.tools-page, .blog-page, .tools-page');
            
            // If not found, check for individual blog post articles
            if (!mainContent) {
                mainContent = body.querySelector('article.blog-post');
            }
            if (!mainContent) {
                mainContent = body.querySelector('.blog-post');
            }
            if (!mainContent) {
                // Last resort: any main element or article
                mainContent = body.querySelector('main, article');
            }
            
            if (mainContent) {
                console.log('Found main content:', mainContent.className || mainContent.tagName, 'tag:', mainContent.tagName);
                // Get only the inner content, not the article tag itself if it might contain unwanted elements
                // But actually, we want the article tag, so use outerHTML
                contentToLoad = mainContent.outerHTML;
                console.log('Content preview (first 200 chars):', contentToLoad.substring(0, 200));
            } else {
                // Fallback: use remaining body content (should not happen)
                console.log('No main content found, using body content');
                contentToLoad = body.innerHTML;
            }
            
            if (!contentToLoad || contentToLoad.trim() === '') {
                console.error('No content extracted from:', filePath);
                return;
            }
            
            console.log('Content extracted, length:', contentToLoad.length);
            
            // Clean contentToLoad string BEFORE creating DOM - remove scripts, headers, footers, and fix paths
            // This prevents browser from trying to load resources with wrong paths
            contentToLoad = contentToLoad.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            contentToLoad = contentToLoad.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
            // Remove header and footer tags completely
            contentToLoad = contentToLoad.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
            contentToLoad = contentToLoad.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
            // Fix ALL relative paths in string - be very aggressive
            // Fix ../images paths
            contentToLoad = contentToLoad.replace(/src="\.\.\/images\//g, 'src="/images/');
            contentToLoad = contentToLoad.replace(/src='\.\.\/images\//g, "src='/images/");
            contentToLoad = contentToLoad.replace(/href="\.\.\/images\//g, 'href="/images/');
            contentToLoad = contentToLoad.replace(/href='\.\.\/images\//g, "href='/images/");
            // Fix ../script.js and ../router.js paths (shouldn't exist, but just in case)
            contentToLoad = contentToLoad.replace(/src="\.\.\/script\.js/g, 'src="/script.js');
            contentToLoad = contentToLoad.replace(/src='\.\.\/script\.js/g, "src='/script.js");
            contentToLoad = contentToLoad.replace(/src="\.\.\/router\.js/g, 'src="/router.js');
            contentToLoad = contentToLoad.replace(/src='\.\.\/router\.js/g, "src='/router.js");
            // Fix any other ../ paths
            contentToLoad = contentToLoad.replace(/src="\.\.\//g, 'src="/');
            contentToLoad = contentToLoad.replace(/src='\.\.\//g, "src='/");
            contentToLoad = contentToLoad.replace(/href="\.\.\//g, 'href="/');
            contentToLoad = contentToLoad.replace(/href='\.\.\//g, "href='/");
            
            console.log('Content after string cleanup, length:', contentToLoad.length);
            
            // Fix relative paths in loaded content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentToLoad;
            
            // Remove header and footer elements if they somehow got included
            const headers = tempDiv.querySelectorAll('header');
            const footers = tempDiv.querySelectorAll('footer');
            headers.forEach(h => {
                console.log('Removing header from loaded content');
                h.remove();
            });
            footers.forEach(f => {
                console.log('Removing footer from loaded content');
                f.remove();
            });
            
            // Remove ALL script tags from loaded content - scripts are already in index.html
            // This prevents duplicate loading and path issues
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => {
                console.log('Removing script tag from loaded content:', script.getAttribute('src') || 'inline script');
                script.remove();
            });
            
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
                    
                    if (originalSrc !== src) {
                        console.log('Fixed image path:', originalSrc, '->', src);
                        img.setAttribute('src', src);
                    }
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
                // Ensure stylesheet is in head with correct absolute path
                let existingStylesheet = document.querySelector('link[rel="stylesheet"]');
                if (!existingStylesheet) {
                    console.warn('Stylesheet not found in head, adding it');
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = '/styles.css';
                    document.head.appendChild(link);
                } else {
                    // Ensure stylesheet uses absolute path
                    const href = existingStylesheet.getAttribute('href');
                    if (href && !href.startsWith('/') && !href.startsWith('http')) {
                        existingStylesheet.setAttribute('href', '/' + href);
                        console.log('Fixed stylesheet path to absolute:', href, '->', '/' + href);
                    }
                }
                
                // Final cleanup: ensure no script tags, headers, or footers remain before inserting
                const finalScripts = tempDiv.querySelectorAll('script');
                const finalHeaders = tempDiv.querySelectorAll('header');
                const finalFooters = tempDiv.querySelectorAll('footer');
                
                if (finalScripts.length > 0) {
                    console.warn('Warning: Found', finalScripts.length, 'script tags, removing them');
                    finalScripts.forEach(s => s.remove());
                }
                if (finalHeaders.length > 0) {
                    console.warn('Warning: Found', finalHeaders.length, 'header elements, removing them');
                    finalHeaders.forEach(h => h.remove());
                }
                if (finalFooters.length > 0) {
                    console.warn('Warning: Found', finalFooters.length, 'footer elements, removing them');
                    finalFooters.forEach(f => f.remove());
                }
                
                // CRITICAL: Clean HTML string BEFORE inserting into DOM
                // Once innerHTML is set, browser executes scripts immediately
                let cleanedHTML = tempDiv.innerHTML;
                
                // Remove scripts using multiple regex patterns to catch all variations
                // Pattern 1: Standard script tags
                cleanedHTML = cleanedHTML.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
                // Pattern 2: Self-closing script tags
                cleanedHTML = cleanedHTML.replace(/<script[^>]*\/>/gi, '');
                // Pattern 3: Script tags with newlines and complex content
                cleanedHTML = cleanedHTML.replace(/<script[\s\S]*?<\/script>/gi, '');
                
                // Remove headers and footers
                cleanedHTML = cleanedHTML.replace(/<header[\s\S]*?<\/header>/gi, '');
                cleanedHTML = cleanedHTML.replace(/<footer[\s\S]*?<\/footer>/gi, '');
                
                // Fix ALL relative paths (../) to absolute paths (/)
                cleanedHTML = cleanedHTML.replace(/src="\.\.\//g, 'src="/');
                cleanedHTML = cleanedHTML.replace(/src='\.\.\//g, "src='/");
                cleanedHTML = cleanedHTML.replace(/href="\.\.\//g, 'href="/');
                cleanedHTML = cleanedHTML.replace(/href='\.\.\//g, "href='/");
                
                console.log('Final cleaned HTML length:', cleanedHTML.length);
                
                // Verify no scripts remain (check in string, not DOM)
                const scriptCount = (cleanedHTML.match(/<script/gi) || []).length;
                if (scriptCount > 0) {
                    console.error('ERROR: Found', scriptCount, 'script tags in cleaned HTML! Removing again...');
                    cleanedHTML = cleanedHTML.replace(/<script[\s\S]*?<\/script>/gi, '');
                    cleanedHTML = cleanedHTML.replace(/<script[^>]*\/>/gi, '');
                }
                
                // Final DOM verification
                const verifyDiv = document.createElement('div');
                verifyDiv.innerHTML = cleanedHTML;
                const verifyScripts = verifyDiv.querySelectorAll('script');
                if (verifyScripts.length > 0) {
                    console.error('ERROR: Scripts found in DOM after cleanup! Removing...');
                    verifyScripts.forEach(s => s.remove());
                    cleanedHTML = verifyDiv.innerHTML;
                }
                
                // For tool pages, inject extracted styles into head first
                if (isToolPage && extractedStyles.length > 0) {
                    // Remove any existing tool page styles
                    const existingToolStyles = document.querySelectorAll('style[data-tool-page]');
                    existingToolStyles.forEach(style => style.remove());
                    
                    // Inject new styles
                    extractedStyles.forEach((styleContent, index) => {
                        const style = document.createElement('style');
                        style.setAttribute('data-tool-page', 'true');
                        style.textContent = styleContent;
                        document.head.appendChild(style);
                        console.log('Injected style block', index + 1, 'for tool page');
                    });
                } else {
                    // Remove tool page styles when navigating away
                    const existingToolStyles = document.querySelectorAll('style[data-tool-page]');
                    existingToolStyles.forEach(style => style.remove());
                }
                
                // NOW insert (scripts should be completely gone)
                app.innerHTML = cleanedHTML;
                console.log('✓ Content inserted into #app, no scripts should remain');
                
                console.log('Content loaded successfully into #app');
                
                // For tool pages, re-execute extracted scripts
                if (isToolPage && (extractedScripts.length > 0 || externalScripts.length > 0)) {
                    console.log('Re-executing scripts for tool page...');
                    
                    // Load external scripts first
                    const loadExternalScripts = externalScripts.map(src => {
                        return new Promise((resolve, reject) => {
                            // Check if script already exists
                            const existing = document.querySelector(`script[src="${src}"]`);
                            if (existing) {
                                console.log('Script already loaded:', src);
                                resolve();
                                return;
                            }
                            
                            const script = document.createElement('script');
                            script.src = src;
                            script.onload = () => {
                                console.log('Loaded external script:', src);
                                resolve();
                            };
                            script.onerror = () => {
                                console.error('Failed to load external script:', src);
                                resolve(); // Don't reject, continue with other scripts
                            };
                            document.head.appendChild(script);
                        });
                    });
                    
                    // Wait for external scripts to load, then execute inline scripts
                    Promise.all(loadExternalScripts).then(() => {
                        // Execute inline scripts after a short delay to ensure DOM is ready
                        setTimeout(() => {
                            extractedScripts.forEach((scriptContent, index) => {
                                try {
                                    console.log('Executing inline script', index + 1);
                                    // Use Function constructor to execute in global scope
                                    const func = new Function(scriptContent);
                                    func();
                                } catch (error) {
                                    console.error('Error executing inline script', index + 1, ':', error);
                                }
                            });
                        }, 100);
                    });
                }
                
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
                
                // Force a reflow to ensure styles are applied
                void app.offsetHeight;
                
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

// Initialize router when DOM is ready
function initializeRouter() {
    console.log('=== Initializing Coffeeclub router ===');
    console.log('Document ready state:', document.readyState);
    console.log('Current URL:', window.location.href);
    console.log('Current pathname:', window.location.pathname);
    
    try {
        if (typeof Router === 'undefined') {
            console.error('Router class is not defined!');
            return;
        }
        
        window.router = new Router();
        console.log('✓ Router initialized successfully');
        console.log('Available routes:', Object.keys(window.router.routes));
        console.log('=== Router initialization complete ===');
    } catch (error) {
        console.error('✗ Error initializing router:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Initialize immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    console.log('DOM is loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initializeRouter);
} else {
    console.log('DOM already loaded, initializing router immediately...');
    initializeRouter();
}

