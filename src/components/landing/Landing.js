import React from "react";
import "./landing.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import network from "../../images/network.png";

export default function Landing() {
  const { t } = useTranslation("common");

  return (
    <>
      {/* top banner section */}
      <section className="top-banner-section d-flex align-items-center">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-md-6">
              <h1 className="fw-bold text-white" style={{ fontSize: "80px" }}>
                {t("ELearning")}{" "}
              </h1>
              <p className="fw-normal" style={{ fontSize: "80px", color: "#f05b5b" }}>
                {t("Platform")}
              </p>
              <hr
                width="50%"
                style={{ backgroundColor: "white", height: "5px" }}
              />
              <h1 className="top-banner-header pb-4">
                {t("WelcometothefutureofClassroom")}
              </h1>
              <Link to="/home">
                <button className="btn top-banner-btn">
                  {t("Exploreteachingservice")}
                </button>
              </Link>
            </div>
            <div className="col-md-6">
              <img
                src={network}
                alt="app"
                width="600vh"
                height="500vh"
                style={{ marginLeft: "150px" }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container pb-5">
        <div className="row d-flex align-items-center justify-content-center">
          <div className="col-md-6">
            <img
              src="https://c.tenor.com/xv9zebVwMMcAAAAC/no-yes.gif"
              alt="landing"
              width="700vh"
              height="700vh"
            />
          </div>
          <div className="col-md-6">
            <h1 className="fw-bold font-link">{t("welcome")}</h1>
            <br />
            <h1>
              <span className="fw-bold font-link-2">
                {t("BESTSIGNLANGUAGE")}
              </span>
              <br /> {t("ELearningplatform")}
            </h1>
            <Link to="/home">
              <button className="btn btn-primary">{t("Getstarted")}</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
