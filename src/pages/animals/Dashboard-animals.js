import React from "react";
import { useNavigate } from "react-router-dom";
import { FaCat, FaDog, FaCrown, FaPaw, FaHorse, FaFish } from 'react-icons/fa';
import './Dashboard-animals.css';

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

    const animals = [
        {
            id: 1,
            name: "Learn Cat",
            description: "Learn sign language for cat and practice and get feedback.",
            image: "images/sign-language.jpg",
            icon: <FaCat />,
            onClick: routeLearnCat,
            available: true
        },
        {
            id: 2,
            name: "Learn Dog",
            description: "Learn sign language for dog and practice and get feedback.",
            image: "images/sign-language.jpg",
            icon: <FaDog />,
            onClick: routeLearnDog,
            available: true
        },
        {
            id: 3,
            name: "Learn Lion",
            description: "Learn sign language for lion and practice and get feedback.",
            image: "images/sign-language.jpg",
            icon: <FaCrown />,
            onClick: routeLearnLion,
            available: true
        },
        {
            id: 4,
            name: "Learn Cow",
            description: "Learn sign language for Cow and practice and get feedback.",
            image: "images/sign-language.jpg",
            icon: <FaPaw />,
            onClick: routeLearnCow,
            available: true
        },
        {
            id: 5,
            name: "Learn Horse",
            description: "Learn sign language for Horse and practice and get feedback.",
            image: "images/sign-language.jpg",
            icon: <FaHorse />,
            onClick: null,
            available: false
        },
        {
            id: 6,
            name: "Learn Fish",
            description: "Learn sign language for fish and practice and get feedback.",
            image: "images/sign-language.jpg",
            icon: <FaFish />,
            onClick: null,
            available: false
        }
    ];

    return (
        <div className="animals-dashboard">
            <div className="animals-header">
                <h1>Choose any sign language and start learning</h1>
            </div>
            <div className="animals-grid">
                {animals.map((animal) => (
                    <div 
                        key={animal.id}
                        className={`animal-card ${!animal.available ? 'coming-soon' : ''}`}
                        onClick={animal.available ? animal.onClick : undefined}
                    >
                        <div className="animal-card-image">
                            <img src={animal.image} alt={animal.name} />
                        </div>
                        <div className="animal-card-body">
                            <h5 className="animal-card-title">
                                {animal.icon}
                                <span className="ms-2">{animal.name}</span>
                            </h5>
                            <p className="animal-card-text">{animal.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
