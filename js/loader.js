"use strict";

async function loadVerbs() {

    const response = await fetch("data/verbs.json");

    const verbs = await response.json();

    return verbs;

}