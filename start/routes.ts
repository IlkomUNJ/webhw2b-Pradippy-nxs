/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/
import router from '@adonisjs/core/services/router'
import { HttpContext } from '@adonisjs/core/http'

router.get('/', async ({ view }: HttpContext) => {
  return view.render('pages/home')
})

router.get('/catalog', async ({ view }: HttpContext) => {
  return view.render('pages/catalog')
})

router.get('/cart', async ({ view }: HttpContext) => {
  return view.render('pages/cart')
})

router.get('/checkout', async ({ view }: HttpContext) => {
  return view.render('pages/checkout')
})

router.get('/wishlist', async ({ view }: HttpContext) => {
  return view.render('pages/wishlist')
})

router.get('/order-success', async ({ view }: HttpContext) => {
  return view.render('pages/order_success')
})

router.get('/seller-dashboard', async ({ view }: HttpContext) => {
  return view.render('pages/seller-dashboard')
})

router.get('/seller-add-product', async ({ view }: HttpContext) => {
  return view.render('pages/seller-add-product')
})