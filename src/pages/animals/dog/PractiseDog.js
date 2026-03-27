import React from 'react';
import { FaDog } from 'react-icons/fa';
import AnimalPractise from '../../../components/animals/AnimalPractise';
import { DogPoses } from '../../../Data/dynamicSign/DogPoses';

export default function PractiseDog() {
  return (
    <AnimalPractise
      poses={DogPoses}
      animalName="Dog"
      animalIcon={<FaDog />}
      backRoute="/learn-dog"
      minProbability={0.9}
    />
  );
}
