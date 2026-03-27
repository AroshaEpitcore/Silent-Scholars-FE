import React from 'react';
import { FaCat } from 'react-icons/fa';
import AnimalPractise from '../../../components/animals/AnimalPractise';
import { CatPoses } from '../../../Data/dynamicSign/CatPoses';

export default function PractiseCat() {
  return (
    <AnimalPractise
      poses={CatPoses}
      animalName="Cat"
      animalIcon={<FaCat />}
      backRoute="/learn-cat"
      minProbability={0.9}
    />
  );
}
