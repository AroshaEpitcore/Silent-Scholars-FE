import React from 'react';
import { FaPaw } from 'react-icons/fa';
import AnimalPractise from '../../../components/animals/AnimalPractise';
import { CowPoses } from '../../../Data/dynamicSign/CowPoses';

export default function PractiseCow() {
  return (
    <AnimalPractise
      poses={CowPoses}
      animalName="Cow"
      animalIcon={<FaPaw />}
      backRoute="/learn-cow"
      minProbability={0.9}
    />
  );
}
