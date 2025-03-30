import React from 'react'
import Footer from '../footer/Footer'
import Header from '../header/Header'

export default function Layout({ children }) {
  return (
    <>
    <Header />
        <body className='d-flex flex-column min-vh-100'>
            {children}
        </body>
    <Footer />
    </>
  )
}
