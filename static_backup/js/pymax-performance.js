/**
 * PYMAX PERFORMANCE OPTIMIZER
 * Sistema de optimización para eliminar lag y mejorar la fluidez
 * Lazy loading, debouncing, caching, virtual scrolling
 */

class PymaxPerformance {
    constructor() {
        this.observers = [];
        this.debounceTimers = {};
        this.cache = new Map();
        this.pendingAnimations = [];
    }

    /**
     * Debounce function - evita ejecutar funciones repetidas veces
     */
    debounce(func, delay = 300, id = 'default') {
        return (...args) => {
            if (this.debounceTimers[id]) {
                clearTimeout(this.debounceTimers[id]);
            }
            
            this.debounceTimers[id] = setTimeout(() => {
                func.apply(this, args);
                delete this.debounceTimers[id];
            }, delay);
        };
    }

    /**
     * Throttle function - limita la frecuencia de ejecución
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Lazy Loading de imágenes
     */
    initLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        this.observers.push(imageObserver);
    }

    /**
     * Lazy Loading de secciones
     */
    initLazySections() {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    const lazyLoadEvent = new CustomEvent('sectionVisible', {
                        detail: { element: entry.target }
                    });
                    window.dispatchEvent(lazyLoadEvent);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('[data-lazy-section]').forEach(section => {
            sectionObserver.observe(section);
        });

        this.observers.push(sectionObserver);
    }

    /**
     * Cache de datos con expiración
     */
    setCache(key, data, expirationMs = 60000) {
        this.cache.set(key, {
            data,
            expires: Date.now() + expirationMs
        });
    }

    /**
     * Obtener del cache
     */
    getCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (Date.now() > cached.expires) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Limpiar cache expirado
     */
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now > value.expires) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Request Animation Frame optimizado
     */
    scheduleAnimation(callback) {
        this.pendingAnimations.push(callback);
        
        if (this.pendingAnimations.length === 1) {
            requestAnimationFrame(() => {
                const animations = [...this.pendingAnimations];
                this.pendingAnimations = [];
                
                animations.forEach(cb => cb());
            });
        }
    }

    /**
     * Optimizar renderizado de listas grandes
     */
    virtualScroll(container, items, renderItem, itemHeight = 60) {
        const containerHeight = container.clientHeight;
        const visibleCount = Math.ceil(containerHeight / itemHeight) + 2;
        let startIndex = 0;

        const render = () => {
            const scrollTop = container.scrollTop;
            const newStartIndex = Math.floor(scrollTop / itemHeight);
            
            if (newStartIndex !== startIndex) {
                startIndex = newStartIndex;
                const visibleItems = items.slice(startIndex, startIndex + visibleCount);
                
                container.innerHTML = '';
                const fragment = document.createDocumentFragment();
                
                visibleItems.forEach((item, index) => {
                    const element = renderItem(item);
                    element.style.position = 'absolute';
                    element.style.top = `${(startIndex + index) * itemHeight}px`;
                    element.style.height = `${itemHeight}px`;
                    fragment.appendChild(element);
                });
                
                container.appendChild(fragment);
            }
        };

        container.addEventListener('scroll', this.throttle(render, 16));
        render();
    }

    /**
     * Preload de assets críticos
     */
    preloadCriticalAssets(urls) {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            
            if (url.endsWith('.js')) {
                link.as = 'script';
            } else if (url.endsWith('.css')) {
                link.as = 'style';
            } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                link.as = 'image';
            }
            
            link.href = url;
            document.head.appendChild(link);
        });
    }

    /**
     * Reducir reflows y repaints
     */
    batchDOMUpdates(updates) {
        requestAnimationFrame(() => {
            updates.forEach(update => update());
        });
    }

    /**
     * Optimizar eventos de scroll
     */
    optimizeScroll(callback, delay = 16) {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    callback();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /**
     * Detectar y reportar performance
     */
    measurePerformance(name, callback) {
        const start = performance.now();
        
        const result = callback();
        
        if (result instanceof Promise) {
            return result.then(res => {
                const end = performance.now();
                console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
                return res;
            });
        } else {
            const end = performance.now();
            console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
            return result;
        }
    }

    /**
     * Reducir tamaño de datos antes de enviar
     */
    compressData(data) {
        return JSON.stringify(data);
    }

    /**
     * Descomprimir datos recibidos
     */
    decompressData(compressed) {
        return JSON.parse(compressed);
    }

    /**
     * Limpiar recursos no utilizados
     */
    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        Object.keys(this.debounceTimers).forEach(key => {
            clearTimeout(this.debounceTimers[key]);
        });
        this.debounceTimers = {};
        
        this.cache.clear();
        this.pendingAnimations = [];
    }

    /**
     * Optimizar fuentes
     */
    optimizeFonts() {
        // Forzar font-display: swap en todas las fuentes
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-display: swap;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Reducir motion para usuarios con preferencias
     */
    respectMotionPreferences() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--transition-duration', '0.01ms');
        }
    }

    /**
     * Inicializar todas las optimizaciones
     */
    init() {
        this.initLazyLoading();
        this.initLazySections();
        this.optimizeFonts();
        this.respectMotionPreferences();
        
        // Limpiar cache expirado cada 5 minutos
        setInterval(() => this.clearExpiredCache(), 300000);
        
        console.log('⚡ Performance optimizer initialized');
    }
}

// Crear instancia global
window.pymaxPerf = new PymaxPerformance();

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.pymaxPerf.init());
} else {
    window.pymaxPerf.init();
}

console.log('⚡ Pymax Performance loaded');
