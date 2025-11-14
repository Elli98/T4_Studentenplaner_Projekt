<template>
 <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 2rem;
  background: #f4f4f7;
  color: #333;
}

h1,
h2 {
  color: #333;
  text-align: center;
}

.card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 1.5rem;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

input[type="text"],
input[type="password"],
textarea,
select {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  font-family: Arial, sans-serif;
}


button {
  width: 100%;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 6px;
  background: #243446;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover {
  background: #092c52;
}

.category-vorlesung {
  border-left-color: #007bff !important;
}
.category-vorlesung .termin-category {
  background-color: #007bff !important;
}

.category-abgabe {
  border-left-color: #fcdb70 !important;
}
.category-abgabe .termin-category {
  background-color: #fcdb70 !important;
}

.category-prüfung {
  border-left-color: #ff0000 !important;
}
.category-prüfung .termin-category {
  background-color: #ff0000 !important;
}
.category-freizeit {
  border-left-color: #28a745 !important;
}
.category-freizeit .termin-category {
  background-color: #28a745 !important;
}
</style>
