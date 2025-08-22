/**
 * [HtmlScript]{@link https://github.com/anarxyfr/StyleScript}
 *
 * @version 1.0.0
 * @author anarxyfr
 * @copyright anarxyfr 2025
 * @license MIT
 */

(function() {
  let compile;

  function processScss() {
    const tags = document.querySelectorAll('scss');
    tags.forEach(tag => {
      const scss = tag.textContent || tag.innerHTML;
      compile(scss).then(css => {
        const style = document.createElement('style');
        style.textContent = css;
        tag.parentNode.insertBefore(style, tag);
        tag.remove();
      }).catch(error => {
        console.error('Failed to compile SCSS:', error);
      });
    });
  }

  function loadDartSass() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sass/sass.dart.js';
      script.onload = () => {
        if (window.sass && typeof sass.compileString === 'function') {
          resolve((scss) => Promise.resolve(sass.compileString(scss).css));
        } else {
          reject('Dart Sass loaded but compileString not available');
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadFallback() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.js';
      script.onload = () => {
        if (window.Sass && typeof Sass.compile === 'function') {
          resolve((scss) => new Promise((res, rej) => {
            Sass.compile(scss, (result) => {
              if (result.status === 0) {
                res(result.text);
              } else {
                rej(result.formatted || result.message || 'Compilation failed');
              }
            });
          }));
        } else {
          reject('sass.js loaded but compile not available');
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  loadDartSass().then(compiler => {
    compile = compiler;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processScss);
    } else {
      processScss();
    }
  }).catch(() => {
    loadFallback().then(compiler => {
      compile = compiler;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processScss);
      } else {
        processScss();
      }
    }).catch(error => {
      console.error('Failed to load any Sass compiler:', error);
    });
  });
})();
