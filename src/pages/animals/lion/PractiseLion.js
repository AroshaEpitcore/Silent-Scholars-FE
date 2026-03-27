import React from 'react';
import { FaCrown } from 'react-icons/fa';
import AnimalPractise from '../../../components/animals/AnimalPractise';
import { LionPoses } from '../../../Data/dynamicSign/LionPoses';

export default function PractiseLion() {
  return (
    <AnimalPractise
      poses={LionPoses}
      animalName="Lion"
      animalIcon={<FaCrown />}
      backRoute="/learn-lion"
      minProbability={0.7}
    />
  );
}
