import React from "react";
import LionModel from "../../../components/animals/lion/Lionmodel";
import LionSignlanguage from "../../../components/animals/lion/Lionsignlanguage";
import "./styles.css";
import { GrClose, GrLinkNext } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "antd";


export default function LearnLion() {

    let navigate = useNavigate();
    const routeDashboard = () => {
        let path = `/dashboard-animals`;
        navigate(path);
    }

    const routePractise = () => {
        let path = `/practise-lion`;
        navigate(path);
    }
    return (
        <>
            <PageHeader
                className="site-page-header"
                title="Lion Sign"
                onBack={() => routeDashboard()}
                subTitle="Learn sign language for lion"
                style={{ border: '1px solid rgb(235, 237, 240)' }}
            />
            <GrClose onClick={routeDashboard} className="position-absolute" style={{ marginRight: "110px", marginTop: "75px", right: "0", zIndex: "999" }} />
            <div className="container position-absolute top-50 start-50 translate-middle">
                <div className="row">
                    <div className="col columnCss" style={{ marginTop: "300px", border: "2px solid black", width: "380px", height: "380px", marginRight: "100px" }}>
                        <LionModel />
                    </div>
                    <div className="col columnCss" style={{ marginTop: "150px" }}>
                        <LionSignlanguage />
                    </div>
                </div>
            </div>
            <button onClick={routePractise} className="position-absolute btn btn-primary" style={{ marginRight: "110px", right: "0", bottom: "0", zIndex: "999" }}>Practise <GrLinkNext /></button>
        </>
    );
}
