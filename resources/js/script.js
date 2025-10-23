document.addEventListener('DOMContentLoaded', () => {
  // GLOBAL HELPERS & STATE

  function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    })
      .format(number)
      .replace('Rp', 'Rp ')
  }

  //CART STORAGE HELPER
  function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || []
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
    updateCartIcon()
  }

  //WISHLIST STORAGE HELPER
  function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || []
  }

  function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }

  //CART ICON UPDATER
  function updateCartIcon() {
    const cart = getCart()
    const cartIcon = document.querySelector('a[href="cart.html"] i')
    if (cartIcon && cart.length > 0) {
      if (!cartIcon.querySelector('.cart-count')) {
        cartIcon.style.position = 'relative'
        const countBadge = document.createElement('span')
        countBadge.className = 'cart-count'
        countBadge.style =
          'position: absolute; top: -8px; right: -12px; background: rgb(243, 114, 44); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 12px; line-height: 18px; text-align: center; font-family: "Outfit";'
        cartIcon.appendChild(countBadge)
      }
      cartIcon.querySelector('.cart-count').textContent = cart.length
    } else if (cartIcon && cart.length === 0) {
      const existingBadge = cartIcon.querySelector('.cart-count')
      if (existingBadge) existingBadge.remove()
    }
  }

  updateCartIcon()

  // CART LOGIC

  const cartItemsContainer = document.querySelector('.page-cart .cart-items')
  const cartSummary = document.querySelector('.page-cart .cart-summary')

  if (cartItemsContainer && cartSummary) {
    const subtotalEl = cartSummary.querySelector('.summary-row:nth-of-type(1) p:nth-child(2)')
    const shippingEl = cartSummary.querySelector('.summary-row:nth-of-type(2) p:nth-child(2)')
    const totalEl = cartSummary.querySelector('.total-row p:nth-child(2)')
    const shippingCost = parseInt(cartSummary.dataset.shippingCost) || 0

    function renderCart() {
      const cart = getCart()
      cartItemsContainer.innerHTML = ''

      if (cart.length === 0) {
        cartItemsContainer.innerHTML =
          '<p style="text-align: center; padding: 20px 0;">Your cart is empty.</p>'
      } else {
        cart.forEach((item) => {
          const itemTotal = item.price * item.quantity
          const itemEl = document.createElement('div')
          itemEl.className = 'cart-item'
          itemEl.dataset.id = item.id
          itemEl.dataset.unitPrice = item.price

          itemEl.innerHTML = `
            <div class="cart-item-details">
              <img
                src="${item.image}"
                alt="${item.title}"
                class="main-product-card-image"
                style="height: 60px; width: 60px; border-style: solid; margin: 0;"
              />
              <div>
                <p class="main-product-card-title" style="margin: 0">${item.title}</p>
                <a href="#" class="cart-item-remove"><i class="fi fi-rr-trash"></i> Remove</a>
              </div>
            </div>
            <div class="cart-item-controls">
              <div class="quantity-selector">
                <a href="#" class="filter-buttons">-</a>
                <span>${item.quantity}</span>
                <a href="#" class="filter-buttons">+</a>
              </div>
              <p class="main-product-card-price">${formatRupiah(itemTotal)}</p>
            </div>
          `
          cartItemsContainer.appendChild(itemEl)
        })
      }
      updateOrderSummary()
    }

    function updateItemPrice(itemEl) {
      const unitPrice = parseInt(itemEl.dataset.unitPrice)
      const quantity = parseInt(itemEl.querySelector('.quantity-selector span').textContent)
      const priceEl = itemEl.querySelector('.main-product-card-price')
      priceEl.textContent = formatRupiah(unitPrice * quantity)

      const cart = getCart()
      const itemInCart = cart.find((item) => item.id === itemEl.dataset.id)
      if (itemInCart) {
        itemInCart.quantity = quantity
        saveCart(cart)
      }

      updateOrderSummary()
    }

    function updateOrderSummary() {
      const cart = getCart()
      let subtotal = 0
      cart.forEach((item) => {
        subtotal += item.price * item.quantity
      })

      const total = subtotal + shippingCost

      subtotalEl.textContent = formatRupiah(subtotal)
      shippingEl.textContent = formatRupiah(shippingCost)
      totalEl.textContent = formatRupiah(total)
    }

    cartItemsContainer.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.cart-item')
      if (!itemEl) return

      if (e.target.closest('.cart-item-remove')) {
        e.preventDefault()
        if (confirm('Are you sure you want to remove this item?')) {
          let cart = getCart()
          cart = cart.filter((item) => item.id !== itemEl.dataset.id)
          saveCart(cart)
          renderCart()
        }
      }

      const quantityEl = itemEl.querySelector('.quantity-selector span')
      if (!quantityEl) return
      let quantity = parseInt(quantityEl.textContent)

      if (e.target.textContent === '+') {
        e.preventDefault()
        quantity++
        quantityEl.textContent = quantity
        updateItemPrice(itemEl)
      }

      if (e.target.textContent === '-') {
        e.preventDefault()
        if (quantity > 1) {
          quantity--
          quantityEl.textContent = quantity
          updateItemPrice(itemEl)
        }
      }
    })

    renderCart()
  }

  //GLOBAL ADD TO CART/WISHLIST FUNCTIONS

  window.handleAddToCart = function (event, buttonEl) {
    event.preventDefault()
    const card = buttonEl.closest('[data-id]')
    const product = {
      id: card.dataset.id,
      title: card.querySelector('.main-product-card-title').textContent,
      price: parseInt(card.dataset.price),
      image: card.querySelector('.main-product-card-image').src,
    }

    const cart = getCart()
    const existingItem = cart.find((item) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      product.quantity = 1
      cart.push(product)
    }

    saveCart(cart)

    buttonEl.textContent = 'Added!'
    setTimeout(() => {
      buttonEl.innerHTML = '+'
    }, 1000)
  }

  window.handleAddToWishlist = function (event, buttonEl) {
    event.preventDefault()
    const card = buttonEl.closest('[data-id]')
    const product = {
      id: card.dataset.id,
      title: card.querySelector('.main-product-card-title').textContent,
      price: parseInt(card.dataset.price),
      image: card.querySelector('.main-product-card-image').src,
    }

    const wishlist = getWishlist()
    const existingItem = wishlist.find((item) => item.id === product.id)

    if (!existingItem) {
      wishlist.push(product)
      saveWishlist(wishlist)
    }

    buttonEl.innerHTML = '<i class="fi fi-rr-heart" style="color: #F3722C;"></i>'
    buttonEl.style.color = '#F3722C'
    alert('Added to Wishlist!')
  }

  // HOME PAGE LOGIC
  const signUpForm = document.querySelector('.main-sign-up-card')
  if (signUpForm) {
    window.handleSignUp = function () {
      const emailInput = document.getElementById('signup-email')
      if (emailInput.value && emailInput.value.includes('@')) {
        alert('Thanks for signing up with ' + emailInput.value + '!')
        emailInput.value = ''
      } else {
        alert('Please enter a valid email address to sign up.')
      }
    }
    const signUpFormEl = signUpForm.querySelector('form')
    if (signUpFormEl) {
      signUpFormEl.addEventListener('submit', (e) => {
        e.preventDefault()
        window.handleSignUp()
      })
    }
  }

  // CATALOG LOGIC
  const catalogControls = document.querySelector('.catalog-controls')
  if (catalogControls) {
    const searchInput = document.getElementById('search-input')
    const searchButton = catalogControls.querySelector('.search-bar button')
    const filterContainer = document.getElementById('filter-container')
    const productContainer = document.querySelector('.product-container')
    const allProducts = productContainer.querySelectorAll('.main-product-card')
    const noResultsMessage = document.getElementById('no-results-message')

    function updateVisibleProducts() {
      const searchTerm = searchInput.value.toLowerCase()
      const activeFilter = filterContainer.querySelector('.filter-active')
      const activeCategory = activeFilter.dataset.category.toLowerCase()
      let productsFound = 0

      allProducts.forEach((product) => {
        const title = product.querySelector('.main-product-card-title').textContent.toLowerCase()
        const category = product.dataset.category.toLowerCase()

        const categoryMatch = activeCategory === 'all' || category.includes(activeCategory)
        const searchMatch = title.includes(searchTerm)

        if (categoryMatch && searchMatch) {
          product.style.display = 'flex'
          productsFound++
        } else {
          product.style.display = 'none'
        }
      })

      noResultsMessage.style.display = productsFound === 0 ? 'block' : 'none'
    }

    searchButton.addEventListener('click', updateVisibleProducts)
    searchInput.addEventListener('keyup', (event) => {
      if (event.key === 'Enter' || searchInput.value === '') {
        updateVisibleProducts()
      }
    })

    filterContainer.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        e.preventDefault()
        filterContainer.querySelectorAll('a').forEach((filter) => {
          filter.classList.remove('filter-active')
        })
        e.target.classList.add('filter-active')
        updateVisibleProducts()
      }
    })

    const loadMoreButton = document.querySelector('.load-more-button')
    if (loadMoreButton) {
      allProducts.forEach((product, index) => {
        if (index >= 6) {
          product.style.display = 'none'
        }
      })
      const totalVisibleProducts = 6
      if (allProducts.length <= totalVisibleProducts) {
        loadMoreButton.style.display = 'none'
      }

      window.handleLoadMore = function () {
        allProducts.forEach((product) => {
          product.style.display = 'flex'
        })
        loadMoreButton.style.display = 'none'
        updateVisibleProducts()
      }
    }
  }

  // WISHLIST LOGIC
  const wishlistContainer = document.querySelector('body.page-wishlist')
  if (wishlistContainer) {
    const wishlistItemsContainer = wishlistContainer.querySelector('.cart-items')

    function renderWishlist() {
      const wishlist = getWishlist()
      wishlistItemsContainer.innerHTML = ''

      if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML =
          '<p style="text-align: center; padding: 20px 0;">Your wishlist is empty.</p>'
      } else {
        wishlist.forEach((item) => {
          const itemEl = document.createElement('div')
          itemEl.className = 'cart-item'
          itemEl.dataset.id = item.id
          itemEl.dataset.price = item.price
          itemEl.dataset.title = item.title
          itemEl.dataset.image = item.image

          itemEl.innerHTML = `
            <div class="cart-item-details">
              <img src="${item.image}" alt="${item.title}" class="main-product-card-image" style="height: 60px; width: 60px; border-style: solid; margin: 0;">
              <div>
                <p class="main-product-card-title" style="margin: 0">${item.title}</p>
                <a href="#" class="cart-item-remove"><i class="fi fi-rr-trash"></i> Remove</a>
              </div>
            </div>
            <div class="cart-item-controls">
              <p class="main-product-card-price" style="margin: 0">${formatRupiah(item.price)}</p>
              <a href="#" class="header-shop-button cart-item-move" style="margin: 0; padding: 10px 15px; width: auto; font-size: 14px;">Add to Cart</a>
            </div>
          `
          wishlistItemsContainer.appendChild(itemEl)
        })
      }
    }

    wishlistItemsContainer.addEventListener('click', (e) => {
      const itemEl = e.target.closest('.cart-item')
      if (!itemEl) return

      if (e.target.closest('.cart-item-remove')) {
        e.preventDefault()
        if (confirm('Are you sure you want to remove this from your wishlist?')) {
          let wishlist = getWishlist()
          wishlist = wishlist.filter((item) => item.id !== itemEl.dataset.id)
          saveWishlist(wishlist)
          renderWishlist()
        }
      }

      if (e.target.closest('.cart-item-move')) {
        e.preventDefault()

        const product = {
          id: itemEl.dataset.id,
          title: itemEl.dataset.title,
          price: parseInt(itemEl.dataset.price),
          image: itemEl.dataset.image,
        }
        const cart = getCart()
        const existingItem = cart.find((item) => item.id === product.id)
        if (existingItem) {
          existingItem.quantity++
        } else {
          product.quantity = 1
          cart.push(product)
        }
        saveCart(cart)

        let wishlist = getWishlist()
        wishlist = wishlist.filter((item) => item.id !== itemEl.dataset.id)
        saveWishlist(wishlist)

        renderWishlist()
        alert('Item moved to cart!')
      }
    })

    renderWishlist()
  }
  // CHECKOUT LOGIC
  const checkoutForm = document.querySelector('.checkout-form')
  if (checkoutForm) {
    const summaryContainer = document.querySelector('.page-checkout .cart-summary')

    function renderCheckoutSummary() {
      const cart = getCart()
      const summaryItemsEl = summaryContainer.querySelector('.summary-items')
      const subtotalEl = summaryContainer.querySelector(
        '.summary-row:nth-of-type(1) p:nth-child(2)'
      )
      const shippingEl = summaryContainer.querySelector(
        '.summary-row:nth-of-type(2) p:nth-child(2)'
      )
      const totalEl = summaryContainer.querySelector('.total-row p:nth-child(2)')
      const shippingCost = 5000

      summaryItemsEl.innerHTML = ''
      let subtotal = 0

      cart.forEach((item) => {
        subtotal += item.price * item.quantity
        const itemEl = document.createElement('div')
        itemEl.className = 'summary-row'
        itemEl.innerHTML = `
                <p>${item.title} (x${item.quantity})</p>
                <p>${formatRupiah(item.price * item.quantity)}</p>
            `
        summaryItemsEl.appendChild(itemEl)
      })

      const total = subtotal + shippingCost

      subtotalEl.textContent = formatRupiah(subtotal)
      shippingEl.textContent = formatRupiah(shippingCost)
      totalEl.textContent = formatRupiah(total)
    }

    window.handlePlaceOrder = function (event) {
      event.preventDefault()
      const nameInput = document.getElementById('name')
      const addressInput = document.getElementById('address')

      if (nameInput.value === '' || addressInput.value === '') {
        alert('Please fill out all required shipping fields.')
        return
      }

      const cart = getCart()
      if (cart.length === 0) {
        alert('Your cart is empty. Please add items before placing an order.')
        window.location.href = 'catalog.html'
        return
      }

      localStorage.removeItem('cart')

      window.location.href = 'order-success.html'
    }

    checkoutForm.addEventListener('submit', window.handlePlaceOrder)
    renderCheckoutSummary()
  }

  // SELLER DB LOGIC
  const sellerDashboard = document.querySelector('body.page-seller-dashboard')
  if (sellerDashboard) {
    window.handleDelete = function (event, button) {
      event.preventDefault()
      if (confirm('Are you sure you want to delete this product?')) {
        button.closest('.cart-item').remove()
        alert('Product deleted. (Demo)')
      }
    }
  }

  // SELLER PRODUCT LOGIC
  const addProductForm = document.querySelector('body.page-seller-add-product')
  if (addProductForm) {
    window.handleAddProduct = function (event) {
      event.preventDefault()
      const productName = document.getElementById('name').value
      if (productName) {
        alert('Successfully added "' + productName + '" to your store! (Demo)')
        window.location.href = 'seller-dashboard.html'
      } else {
        alert('Please enter a product name.')
      }
    }
    const formEl = document.querySelector('.checkout-form')
    if (formEl) {
      formEl.addEventListener('submit', window.handleAddProduct)
    }
  }
})
