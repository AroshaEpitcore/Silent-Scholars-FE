import React from 'react';
import './dashboard.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardDetails } from '../../Data/DashboardData';

export default function Dashboard() {

    const { t } = useTranslation("common");

    return (
        <div className="container-fluid">
            <h1 className="text-center mt-5 display-3 fw-bold"> <span className="theme-text">{t("Services")}</span></h1>
            <hr className="mx-auto mb-5 mt-5 w-25" />
            <div className="row mb-5 mx-5">
                {DashboardDetails.map(( detail ) => (
                <div className="col-12 col-sm-6 col-md-3 m-auto" key={detail.id}>
                    {/* <!-- card starts here --> */}
                    <div className="card shadow">
                        <img src={detail.image} alt="web" className="card-img-top" />
                        <div className="card-body">
                            <h3 className="text-center">{t(detail.title)}</h3>
                            <hr className="mx-auto w-75" />
                            <p>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut eligendi soluta est veniam sequi
                                nemo, quas delectus eveniet ducimus rem animi. Natus non earum deleniti aliquam
                            </p>

                            <Link to={detail.link}>
                            <button className='btn btn-outline-primary right primary outline shaded btn-icon'>
                                <span> {t("LearnMore")} {">>"} </span>
                            </button>
                            </Link>
                        </div>
                    </div>
                    {/* <!-- card ends here --> */}
                </div>
                ))}
                {/* <!-- col ends here --> */}
            </div>
        </div>
        
    )
}
