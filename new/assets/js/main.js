/**
* Template Name: Flattern - v4.7.0
* Template URL: https://bootstrapmade.com/flattern-multipurpose-bootstrap-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
window.ccpdRoute = (function() {
  "use strict";

  /**
   * Easy selector helper function
   */
  const select = (el, all = false) => {
    el = el.trim()
    if (all) {
      return [...document.querySelectorAll(el)]
    } else {
      return document.querySelector(el)
    }
  }

  /**
   * Easy event listener function
   */
  const on = (type, el, listener, all = false) => {
    let selectEl = select(el, all)
    if (selectEl) {
      if (all) {
        selectEl.forEach(e => e.addEventListener(type, listener))
      } else {
        selectEl.addEventListener(type, listener)
      }
    }
  }

  /**
   * Easy on scroll event listener 
   */
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener)
  }

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = (el) => {
    let header = select('#header')
    let offset = header.offsetHeight

    if (!header.classList.contains('header-scrolled')) {
      offset -= 16
    }

    let elementPos = select(el).offsetTop
    window.scrollTo({
      top: elementPos - offset,
      behavior: 'smooth'
    })
  }

  /**
   * Header fixed top on scroll
   */
  let selectHeader = select('#header')
  if (selectHeader) {
    let headerOffset = selectHeader.offsetTop
    let nextElement = selectHeader.nextElementSibling
    const headerFixed = () => {
      if ((headerOffset - window.scrollY) <= 0) {
        selectHeader.classList.add('fixed-top')
        nextElement.classList.add('scrolled-offset')
      } else {
        selectHeader.classList.remove('fixed-top')
        nextElement.classList.remove('scrolled-offset')
      }
    }
    window.addEventListener('load', headerFixed)
    onscroll(document, headerFixed)
  }

  /**
   * Back to top button
   */
  let backtotop = select('.back-to-top')
  if (backtotop) {
    const toggleBacktotop = () => {
      if (window.scrollY > 100) {
        backtotop.classList.add('active')
      } else {
        backtotop.classList.remove('active')
      }
    }
    window.addEventListener('load', toggleBacktotop)
    onscroll(document, toggleBacktotop)
  }

  /**
   * Mobile nav toggle
   */
  on('click', '.mobile-nav-toggle', function(e) {
    select('#navbar').classList.toggle('navbar-mobile')
    this.classList.toggle('bi-list')
    this.classList.toggle('bi-x')
  })

  /**
   * Mobile nav dropdowns activate
   */
  on('click', '.navbar .dropdown > a', function(e) {
    if (select('#navbar').classList.contains('navbar-mobile')) {
      e.preventDefault()
      this.nextElementSibling.classList.toggle('dropdown-active')
    }
  }, true)

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on('click', '.scrollto', function(e) {
    if (select(this.hash)) {
      e.preventDefault()

      let navbar = select('#navbar')
      if (navbar.classList.contains('navbar-mobile')) {
        navbar.classList.remove('navbar-mobile')
        let navbarToggle = select('.mobile-nav-toggle')
        navbarToggle.classList.toggle('bi-list')
        navbarToggle.classList.toggle('bi-x')
      }
      scrollto(this.hash)
    }
  }, true)

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener('load', () => {
    if (window.location.hash) {
      if (select(window.location.hash)) {
        scrollto(window.location.hash)
      }
    }
  });

  /**
   * Hero carousel indicators
   */
  let heroCarouselIndicators = select("#hero-carousel-indicators")
  let heroCarouselItems = select('#heroCarousel .carousel-item', true)

  heroCarouselItems.forEach((item, index) => {
    (index === 0) ?
    heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "' class='active'></li>":
      heroCarouselIndicators.innerHTML += "<li data-bs-target='#heroCarousel' data-bs-slide-to='" + index + "'></li>"
  });

  const linkClickHandler = (e) => {
    e.preventDefault()

    var nextPage = e.target.getAttribute('href') || e.target.getAttribute('data-url')
    if (window.ccpdRoute === nextPage) {
      return
    }
    window.ccpdRoute = nextPage;
    if (nextPage.indexOf('/new') === -1) {
      nextPage = '/new' + nextPage
    }
    var titleSuffix = e.target.getAttribute('data-suffix')
    history.pushState({url: nextPage, titleSuffix: titleSuffix }, null, nextPage)

    // here we can fix the current classes

    // Only show the slideshow on the homepage but it remains in the DOM throughout navigation
    document.getElementById('hero').style.display = (nextPage === '/new/' || nextPage === '/new') ? '' : 'none'

    // and update text with the data variable

    // and make an Ajax request for the .content element
    console.log(`loading page: ${nextPage}`)
    requestContent(nextPage)

    // update the document's title
    document.title = 'Cincinnati Caledonian Pipes & Drums Band - ' + titleSuffix || ''

    e.stopPropagation()

    window.scrollTo(0, 0)
  }

  const requestContent = (url) => {
    if (url === '/new/' || url === '/new') {
      url = '/new/home';
    }
    fetch(url)
        .then(data => {
            return data.text()
        })
        .then(data => {
            document.getElementById('main').innerHTML = data

            // Add a click handler to the icon-box elements on the homepage to nav to the same place as their child links
            Array.from(document.querySelectorAll('.icon-box')).map(iconBox => {
              iconBox.addEventListener('click', linkClickHandler)
            });
        })
  }

  const goToYourHome = () => {
    document.getElementById('hero').style.display = ''
    requestContent('/new/')
    document.title = "Cincinnati Caledonian Pipes & Drums Band - Home"
    // todo: set "active" class on the "Home" link
    //onscroll(document, toggleBacktotop)
  }

  // Support browser refreshes on content pages and bookmarking of content pages
  let validPages = ['home', 'hire', 'lessons', 'calendar', 'contact']
  const navToContentPageWhenAppropriate = () => {
    if (window.location.search) {
      let targetPage = validPages.filter((p) => `?r=${p}` === window.location.search.toLowerCase())
      if (targetPage.length === 1) {
        document.getElementById(`lnk${targetPage[0][0].toUpperCase()}${targetPage[0].substring(1)}`).click()
      }
    }
  }

  window.addEventListener('load', () => {
    console.log(window.location.search);

    // On initial load of the homepage, load the home content
    if (!window.location.search) {
      goToYourHome();
    }

    document.querySelectorAll('a[href^="/"]').forEach(el =>
      el.addEventListener('click', linkClickHandler)
    );

    // Support for user refreshing the browser on sub-page or bookmarking a sub-page
    navToContentPageWhenAppropriate()
  });

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox({
    selector: '.portfolio-lightbox'
  });

  /**
   * Portfolio details slider
   */
  new Swiper('.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  });

  /**
   * Animation on scroll
   */
  window.addEventListener('load', () => {
    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    })
  });

  /**
   * Supports browser back and forward button navigating this single page app
   */
  window.addEventListener('popstate', e => {
    if (e.state === null) {
        //removeCurrentClass()
        goToYourHome()
    } else {
        requestContent(e.state.url)
        //addCurrentClass(character);
        document.title = "Cincinnati Caledonian Pipes & Drums Band - " + e.state.titleSuffix || ''
    }
  });

  return '/';
})()