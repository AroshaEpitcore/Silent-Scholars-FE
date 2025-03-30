import React from "react";
import CatModel from "../../../components/animals/cat/Catmodel";
import CatSignlanguage from "../../../components/animals/cat/Catsignlanguage";
import "./styles.css";
import { GrClose, GrLinkNext } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "antd";


export default function LearnCat() {

    let navigate = useNavigate();
    const routeDashboard = () => {
        let path = `/dashboard-animals`;
        navigate(path);
    }
    const routePractise = () => {
        let path = `/practise-cat`;
        navigate(path);
    }

    return (
        <>
            <PageHeader
                className="site-page-header"
                title="Cat Sign"
                onBack={() => routeDashboard()}
                subTitle="Learn sign language for cat"
                style={{ border: '1px solid rgb(235, 237, 240)' }}
            />
            <GrClose onClick={routeDashboard} className="position-absolute" style={{ marginRight: "110px", marginTop: "75px", right: "0", zIndex: "999" }} />
            <div className="container position-absolute top-50 start-50 translate-middle">
                <div className="row">
                    <div className="col columnCss" style={{ marginTop: "330px", border: "1px solid #98B7C9", width: "320px", height: "330px", marginRight: "100px"  ,backgroundColor:"#E2EEF5"}}>
                        <CatModel />
                    </div>
                    <div className="col columnCss" style={{ marginTop: "150px" }}>
                        <CatSignlanguage />
                    </div>
                </div>
            </div>
            <button onClick={routePractise} className="position-absolute btn btn-primary" style={{ marginRight: "110px", right: "0", bottom: "0", zIndex: "999" }}>Practise <GrLinkNext /></button>
        </>
    );
}
