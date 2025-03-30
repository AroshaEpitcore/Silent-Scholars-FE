import React from "react";
import DogModel from "../../../components/animals/dog/Dogmodel";
import DogSignlanguage from "../../../components/animals/dog/Dogsignlanguage";
import "./styles.css";
import { GrClose, GrLinkNext } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "antd";


export default function LearnDog() {

    let navigate = useNavigate();
    const routeDashboard = () => {
        let path = `/dashboard-animals`;
        navigate(path);
    }

    const routePractise = () => {
        let path = `/practise-dog`;
        navigate(path);
    }
    return (
        <>
            <PageHeader
                className="site-page-header"
                title="Dog Sign"
                onBack={() => routeDashboard()}
                subTitle="Learn sign language for dog"
                style={{ border: '1px solid rgb(235, 237, 240)' }}
            />
            <GrClose onClick={routeDashboard} className="position-absolute" style={{ marginRight: "110px", marginTop: "75px", right: "0", zIndex: "999" }} />
            <div className="container position-absolute top-50 start-50 translate-middle">
                <div className="row">
                    <div className="col columnCss" style={{ marginTop: "300px", border: "2px solid black", width: "380px", height: "380px", marginRight: "100px" }}>
                        <DogModel />
                    </div>
                    <div className="col columnCss" style={{ marginTop: "150px" }}>
                        <DogSignlanguage />
                    </div>
                </div>
            </div>
            <button onClick={routePractise} className="position-absolute btn btn-primary" style={{ marginRight: "110px", right: "0", bottom: "0", zIndex: "999" }}>Practise <GrLinkNext /></button>
        </>
    );
}
