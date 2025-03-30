import React from "react";

export default function Footer() {
  return (
    // <!-- Footer -->
    <footer className="text-center text-lg-start bg-dark text-muted mt-auto">
      {/* <!-- Section: Social media --> */}
      <section className="d-flex justify-content-center justify-content-md-between p-4 border-bottom">
        {/* <!-- Left --> */}
        <div className="me-5 d-none d-md-block">
          <span>Get connected with us on social networks:</span>
        </div>
        {/* <!-- Left --> */}

        {/* <!-- Right --> */}
        <div>
          <a href="" className="me-4 text-reset">
            <img src="https://img.icons8.com/fluency/48/000000/facebook-new.png" />
          </a>
          <a href="" className="me-4 text-reset">
            <img src="https://img.icons8.com/fluency/48/000000/twitter.png" />
          </a>
          <a href="" className="me-4 text-reset">
            <img src="https://img.icons8.com/fluency/48/000000/instagram-new.png" />
          </a>
          <a href="" className="me-4 text-reset">
            <img src="https://img.icons8.com/color/48/000000/linkedin-circled--v1.png" />
          </a>
        </div>
        {/* <!-- Right --> */}
      </section>
      {/* <!-- Section: Social media --> */}
    </footer>
    // <!-- Footer -->
  );
}
