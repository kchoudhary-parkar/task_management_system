import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div id="cyber-loader">
    <div class="datastream">
      <div class="bar bar-1"></div>
      <div class="bar bar-2"></div>
      <div class="bar bar-3"></div>
      <div class="bar bar-4"></div>
      <div class="bar bar-5"></div>
      <div class="bar bar-6"></div>
      <div class="bar bar-7"></div>
      <div class="bar bar-8"></div>
    </div>
    <div class="loader-text">Synchronization in progress...</div>
  </div>
  );
}