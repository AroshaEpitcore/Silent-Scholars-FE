import React from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardAnimals() {

    let navigate = useNavigate();
    const routeLearnCat = () => {
        let path = `/learn-cat`;
        navigate(path);
    }
    const routeLearnDog = () => {
        let path = `/learn-dog`;
        navigate(path);
    }
    const routeLearnLion = () => {
        let path = `/learn-lion`;
        navigate(path);
    }
    const routeLearnCow = () => {
        let path = `/learn-cow`;
        navigate(path);
    }


    return (
        <div>
            <div className="container">
                <br />
                <h1 className="text-center">Choose any sign language and start learning</h1>
                <br />
                <div class="row row-cols-1 row-cols-md-3 g-4 mb-4">
                    <div class="col">
                        <div class="card" onClick={routeLearnCat}>
                            <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Learn Cat</h5>
                                <p class="card-text">Learn sign language for cat and practice and get feedback.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card" onClick={routeLearnDog}>
                            <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Learn Dog</h5>
                                <p class="card-text">Learn sign language for dog and practice and get feedback.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card" onClick={routeLearnLion}>
                            <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Learn Lion</h5>
                                <p class="card-text">Learn sign language for lion and practice and get feedback.</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Second line */}
                <div class="row row-cols-1 row-cols-md-3 g-4">
                    <div class="col">
                        <div class="card" onClick={routeLearnCow}>
                            <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Learn Cow</h5>
                                <p class="card-text">Learn sign language for Cow and practice and get feedback.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card">
                            <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Learn Elephant</h5>
                                <p class="card-text">Learn sign language for Elephant and practice and get feedback.</p>
                            </div>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card">
                            <img src="images/sign-language.jpg" class="card-img-top" alt="..." />
                            <div class="card-body">
                                <h5 class="card-title">Learn Fish</h5>
                                <p class="card-text">Learn sign language for fish and practice and get feedback.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            <br />
        </div>
    );
}
