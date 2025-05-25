import { useEffect, useState, useRef } from 'react';
import { Search, Sun, Moon, ChefHat, Circle, Sparkles, Heart } from 'lucide-react';
import chefgenie from '../src/assets/chefGenielogo.png'

const GEMINI_API_KEY = 'AIzaSyD__dfd9rqq4bAjxGMLezTglrTs2DDaU0o';

function parseRecipe(raw) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  
  // Extract title (first non-empty line, remove any markdown formatting)
  let title = '';
  let titleIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^#+\s*/, '').replace(/^\*+\s*/, '').trim();
    if (line && !line.startsWith('**') && line.length > 3) {
      title = line;
      titleIndex = i;
      break;
    }
  }
  
  const ingredients = [];
  const steps = [];
  let mode = '';
  
  for (let i = titleIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    
    if (/^\*\*Ingredients:?/i.test(line)) {
      mode = 'ing';
    } else if (/^\*\*(Instructions|Steps|Directions):?/i.test(line)) {
      mode = 'steps';
    } else if (mode === 'ing' && /^\*/.test(line)) {
      const ingredient = line
        .replace(/^\*+\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .trim();
      if (ingredient) ingredients.push(ingredient);
    } else if (mode === 'steps' && /^\d+\./.test(line)) {
      const step = line
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .trim();
      if (step) steps.push(step);
    }
  }
  
  return { title, ingredients, steps };
}

// Floating particles component
const FloatingParticles = ({ dark }) => {
  const [animeLoaded, setAnimeLoaded] = useState(false);
  
  useEffect(() => {
    // Load anime.js if not already loaded
    if (!window.anime) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
      script.onload = () => {
        setAnimeLoaded(true);
        animateParticles();
      };
      document.head.appendChild(script);
    } else {
      setAnimeLoaded(true);
      animateParticles();
    }
  }, []);

  const animateParticles = () => {
    if (window.anime) {
      window.anime({
        targets: '.floating-particle',
        translateY: [
          { value: -20, duration: 2000 },
          { value: 0, duration: 2000 }
        ],
        translateX: [
          { value: 10, duration: 1500 },
          { value: -10, duration: 1500 },
          { value: 0, duration: 1500 }
        ],
        rotate: '1turn',
        opacity: [0.3, 0.8, 0.3],
        duration: 4000,
        loop: true,
        delay: (el, i) => i * 200,
        easing: 'easeInOutSine'
      });
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className={`floating-particle absolute w-2 h-2 rounded-full transition-colors duration-500 ${
            dark ? 'bg-orange-400' : 'bg-orange-300'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3
          }}
        />
      ))}
    </div>
  );
};

export default function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [recipeVisible, setRecipeVisible] = useState(false);
  const [themeTransitioning, setThemeTransitioning] = useState(false);
  const [animeReady, setAnimeReady] = useState(false);

  const recipeRef = useRef(null);
  const titleRef = useRef(null);
  const headerRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const themeOverlayRef = useRef(null);

  // Load anime.js
  useEffect(() => {
    if (!window.anime) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js';
      script.onload = () => setAnimeReady(true);
      document.head.appendChild(script);
    } else {
      setAnimeReady(true);
    }
  }, []);

  // Dramatic entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleVisible(true);
      
      if (animeReady && window.anime) {
        // Header entrance animation
        window.anime({
          targets: headerRef.current,
          translateY: [-50, 0],
          opacity: [0, 1],
          duration: 1200,
          easing: 'easeOutElastic(1, .8)',
          complete: () => {
            // Chef hat bounce animation
            window.anime({
              targets: '.chef-hat',
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
              duration: 800,
              easing: 'easeInOutBack'
            });
          }
        });

        // Title text animation with stagger
        window.anime({
          targets: '.title-char',
          translateY: [30, 0],
          opacity: [0, 1],
          duration: 600,
          delay: (el, i) => i * 50,
          easing: 'easeOutExpo'
        });

        // Input field slide-in
        window.anime({
          targets: inputRef.current,
          translateX: [-100, 0],
          opacity: [0, 1],
          duration: 800,
          delay: 600,
          easing: 'easeOutCubic'
        });

        // Button pop-in
        window.anime({
          targets: buttonRef.current,
          scale: [0, 1],
          opacity: [0, 1],
          duration: 600,
          delay: 1000,
          easing: 'easeOutBack(1.7)'
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [animeReady]);

  // Theme transition animation
  const handleThemeToggle = async () => {
    setThemeTransitioning(true);
    
    if (animeReady && window.anime) {
      if (!dark) {
        // Light to dark transition
        window.anime({
          targets: themeOverlayRef.current,
          scale: [0, 30],
          opacity: [0, 1, 0],
          duration: 1000,
          easing: 'easeInOutQuad',
          complete: () => {
            setDark(true);
            setThemeTransitioning(false);
          }
        });
      } else {
        // Dark to light transition
        window.anime({
          targets: themeOverlayRef.current,
          scale: [30, 0],
          opacity: [0, 1, 0],
          duration: 1000,
          easing: 'easeInOutQuad',
          complete: () => {
            setDark(false);
            setThemeTransitioning(false);
          }
        });
      }
    } else {
      setDark(!dark);
      setThemeTransitioning(false);
    }
  };

  // Recipe generation with loading animation
  const handleGetRecipe = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setRecipe('');
    setRecipeVisible(false);
    
    // Loading animation sequence
    if (animeReady && window.anime) {
      // Button morphing animation
      window.anime({
        targets: buttonRef.current,
        scale: [1, 0.9, 1],
        duration: 300,
        easing: 'easeInOutQuad'
      });

      // Input field glow effect
      window.anime({
        targets: inputRef.current,
        boxShadow: [
          '0 0 0 rgba(249, 115, 22, 0)',
          '0 0 20px rgba(249, 115, 22, 0.3)',
          '0 0 0 rgba(249, 115, 22, 0)'
        ],
        duration: 2000,
        loop: true,
        easing: 'easeInOutSine'
      });

      // Floating sparkles during loading
      window.anime({
        targets: '.loading-sparkle',
        translateY: [0, -30],
        translateX: () => window.anime.random(-20, 20),
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        duration: 1500,
        loop: true,
        delay: (el, i) => i * 200,
        easing: 'easeOutQuad'
      });
    }
    
    const prompt = `Create a simple, tasty recipe using these ingredients: ${ingredients}. 

Format your response exactly like this:
# [Recipe Name]

**Ingredients:**
* ingredient 1
* ingredient 2
* etc.

**Instructions:**
1. step 1
2. step 2
3. etc.

Make sure to include a clear recipe name as the title and use proper formatting.`;
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setRecipe(aiText || 'Oops, something went wrong.');
    } catch (err) {
      console.error(err);
      setRecipe('Error generating recipe.');
    } finally {
      setLoading(false);
    }
  };

  // Recipe card entrance animation
  useEffect(() => {
    if (recipe && animeReady && window.anime) {
      setRecipeVisible(false);
      
      setTimeout(() => {
        setRecipeVisible(true);
        
        // Recipe card dramatic entrance
        window.anime({
          targets: recipeRef.current,
          translateY: [100, 0],
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 800,
          easing: 'easeOutBack(1.7)',
          complete: () => {
            // Ingredients cascade animation
            window.anime({
              targets: '.ingredient-item',
              translateX: [-50, 0],
              opacity: [0, 1],
              duration: 400,
              delay: (el, i) => i * 100,
              easing: 'easeOutCubic'
            });

            // Steps animation with rotation
            window.anime({
              targets: '.step-item',
              translateX: [50, 0],
              rotateY: [90, 0],
              opacity: [0, 1],
              duration: 600,
              delay: (el, i) => 500 + (i * 150),
              easing: 'easeOutExpo'
            });

            // Recipe title animation
            window.anime({
              targets: '.recipe-title',
              scale: [0.5, 1.1, 1],
              opacity: [0, 1],
              duration: 600,
              easing: 'easeOutElastic(1, .8)'
            });
          }
        });
      }, 100);
    }
  }, [recipe, animeReady]);

  const { title, ingredients: ingList = [], steps: stepList = [] } = recipe
    ? parseRecipe(recipe)
    : {};

  return (
    <div className={`min-h-screen transition-all duration-700 relative overflow-hidden ${
      dark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50'
    }`}>
      {/* Theme transition overlay */}
      <div
        ref={themeOverlayRef}
        className={`fixed inset-0 pointer-events-none z-50 rounded-full ${
          dark ? 'bg-yellow-200' : 'bg-gray-900'
        }`}
        style={{
          transform: 'scale(0)',
          transformOrigin: '50% 50%'
        }}
      />

      {/* Floating particles background */}
      <FloatingParticles dark={dark} />

      {/* Loading sparkles */}
      {loading && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {[...Array(8)].map((_, i) => (
            <Sparkles
              key={i}
              className={`loading-sparkle absolute ${dark ? 'text-yellow-400' : 'text-orange-400'}`}
              size={16}
              style={{
                left: `${30 + i * 10}%`,
                top: `${40 + Math.sin(i) * 20}%`
              }}
            />
          ))}
        </div>
      )}

      <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 relative z-10">
        <header 
          ref={headerRef}
          className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4 sm:gap-0"
        >
          <div className="flex items-center gap-3">
            <img src={chefgenie}
              className="chef-hat text-3xl sm:text-4xl text-orange-500 cursor-pointer hover:text-orange-600 transition-colors h-[100px] w-[100px]" 
              size={typeof window !== 'undefined' && window.innerWidth < 640 ? 28 : 36} 
            />
            <div className='flex flex-col'>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              {['C','h','e','f',' ','G','e','n','i','e'].map((char, i) => (
                <span key={i} className={`title-char inline-block ${dark ? 'text-white' : 'text-gray-800'}`}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </h1>
            <h3 className='text-gray-500 text-s sm:text-m lg:text-l'>your magical cooking companion</h3>
            </div>
          </div>
          
          <button
            onClick={handleThemeToggle}
            disabled={themeTransitioning}
            className={`p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 transform active:scale-95 relative overflow-hidden ${
              dark 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-400 hover:from-gray-700 hover:to-gray-600 shadow-lg shadow-gray-900/50' 
                : 'bg-gradient-to-r from-white to-gray-50 text-gray-600 hover:from-gray-50 hover:to-gray-100 shadow-lg hover:shadow-xl'
            } ${themeTransitioning ? 'animate-pulse' : ''}`}
          >
            <div className="relative z-10">
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-full"></div>
          </button>
        </header>

        <p className={`mb-6 sm:mb-8 text-center text-base sm:text-lg transition-all duration-500 delay-300 max-w-2xl ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        } ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          Don't know what to make? Just tell me what you have and I'll create something amazing for you! ✨
        </p>

        <div className={`w-full max-w-md lg:max-w-lg flex flex-col gap-4 sm:gap-6 transition-all duration-500 delay-500 ${
          titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}>
          <div className="relative group">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter ingredients (e.g., chicken, rice, tomatoes)"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className={`w-full px-4 sm:px-6 py-3 sm:py-4 pr-12 sm:pr-14 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 text-base sm:text-lg ${
                dark 
                  ? 'bg-gray-800/80 backdrop-blur-sm border-gray-600 text-white placeholder-gray-400 focus:border-orange-400 focus:ring-orange-400/30' 
                  : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-800 placeholder-gray-500 focus:border-orange-400 focus:ring-orange-400/30 shadow-lg focus:shadow-xl'
              } group-hover:shadow-lg transform transition-transform group-hover:scale-[1.02]`}
              onKeyPress={(e) => e.key === 'Enter' && handleGetRecipe()}
            />
            <Search 
              className={`absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 transition-colors duration-300 ${
                dark ? 'text-gray-400 group-hover:text-orange-400' : 'text-gray-400 group-hover:text-orange-500'
              }`} 
              size={20} 
            />
            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 ${
              dark ? 'bg-orange-400' : 'bg-orange-300'
            }`} style={{ zIndex: -1 }}></div>
          </div>
          
          <button
            ref={buttonRef}
            onClick={handleGetRecipe}
            disabled={loading || !ingredients.trim()}
            className={`w-full py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group ${
              dark
                ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-2xl'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            <div className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Creating Magic...</span>
                  <Heart className="animate-pulse text-pink-200" size={16} />
                </>
              ) : (
                <>
                  <span>Generate Recipe</span>
                  <Sparkles className="group-hover:animate-spin transition-transform duration-300" size={16} />
                </>
              )}
            </div>
          </button>
        </div>

        {recipe && (
          <div
            ref={recipeRef}
            className={`w-full max-w-4xl mt-8 sm:mt-12 transition-all duration-800 ${
              recipeVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className={`p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-sm relative overflow-hidden ${
              dark 
                ? 'bg-gray-800/90 border border-gray-700/50' 
                : 'bg-white/90 shadow-2xl border border-white/20'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-orange-400/20 to-transparent rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-transparent rounded-full blur-2xl"></div>
              
              <h2 className={`recipe-title text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-center relative ${
                dark ? 'text-white' : 'text-gray-800'
              }`}>
                {title}
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 rounded-full ${
                  dark ? 'bg-gradient-to-r from-orange-400 to-pink-400' : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}></div>
              </h2>

              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 relative">
                <div className="space-y-4">
                  <h3 className={`text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-3 ${
                    dark ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    <div className={`p-2 rounded-lg ${dark ? 'bg-orange-400/20' : 'bg-orange-100'}`}>
                      <Circle size={20} className="fill-current" />
                    </div>
                    Ingredients
                  </h3>
                  <div className="space-y-3">
                    {ingList.map((ing, idx) => (
                      <div
                        key={idx}
                        className={`ingredient-item flex items-start gap-4 p-3 sm:p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer group ${
                          dark 
                            ? 'hover:bg-gray-700/50 border border-gray-700/30 hover:border-orange-400/30' 
                            : 'hover:bg-orange-50/80 border border-gray-200/50 hover:border-orange-300/50 hover:shadow-md'
                        }`}
                      >
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 transition-colors duration-300 ${
                          dark ? 'bg-orange-400 group-hover:bg-orange-300' : 'bg-orange-500 group-hover:bg-orange-600'
                        }`} />
                        <span 
                          className={`${dark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-700 group-hover:text-gray-800'} transition-colors duration-300`}
                          dangerouslySetInnerHTML={{ __html: ing }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className={`text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-3 ${
                    dark ? 'text-orange-400' : 'text-orange-600'
                  }`}>
                    <div className={`p-2 rounded-lg ${dark ? 'bg-orange-400/20' : 'bg-orange-100'}`}>
                      <Circle size={20} className="fill-current" />
                    </div>
                    Instructions
                  </h3>
                  <ol className="space-y-4">
                    {stepList.map((step, idx) => (
                      <li
                        key={idx}
                        className={`step-item flex gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer group ${
                          dark 
                            ? 'hover:bg-gray-700/50 border border-gray-700/30 hover:border-orange-400/30' 
                            : 'hover:bg-orange-50/80 border border-gray-200/50 hover:border-orange-300/50 hover:shadow-md'
                        }`}
                      >
                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 group-hover:scale-110 ${
                          dark 
                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white group-hover:from-orange-500 group-hover:to-red-500' 
                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white group-hover:from-orange-600 group-hover:to-red-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span 
                          className={`${dark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-700 group-hover:text-gray-800'} transition-colors duration-300 leading-relaxed`}
                          dangerouslySetInnerHTML={{ __html: step }}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  dark 
                    ? 'bg-gradient-to-r from-green-600/20 to-blue-600/20 text-green-400 border border-green-500/30' 
                    : 'bg-gradient-to-r from-green-100 to-blue-100 text-green-600 border border-green-200'
                }`}>
                  <Heart className="animate-pulse" size={16} />
                  <span className="font-medium">Recipe Ready! Happy Cooking! 🍳</span>
                  <Sparkles className="animate-pulse" size={16} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(249, 115, 22, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(249, 115, 22, 0.6), 0 0 30px rgba(249, 115, 22, 0.4);
    }
  }

  .floating-particle {
    animation: float 4s ease-in-out infinite;
  }

  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }

  /* Responsive breakpoints */
  @media (max-width: 640px) {
    .recipe-title {
      font-size: 1.5rem;
    }
    
    .floating-particle {
      width: 4px;
      height: 4px;
    }
  }

  @media (min-width: 641px) and (max-width: 1024px) {
    .recipe-title {
      font-size: 2rem;
    }
  }

  @media (min-width: 1025px) {
    .recipe-title {
      font-size: 2.5rem;
    }
  }

  /* Custom scrollbar - light theme */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: #ef4444;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #dc2626;
  }

  /* Dark theme scrollbar */
  .dark ::-webkit-scrollbar-track {
    background: #374151;
  }

  .dark ::-webkit-scrollbar-thumb {
    background: #f97316;
  }

  .dark ::-webkit-scrollbar-thumb:hover {
    background: #ea580c;
  }

  /* Enhanced hover effects */
  .ingredient-item:hover,
  .step-item:hover {
    transform: translateX(5px) scale(1.02);
    transition: transform 0.2s ease;
  }

  .chef-hat:hover {
    animation: bounce 0.6s ease-in-out;
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0,-8px,0);
    }
    70% {
      transform: translate3d(0,-4px,0);
    }
    90% {
      transform: translate3d(0,-2px,0);
    }
  }
`}</style>
    </div>
  );
}