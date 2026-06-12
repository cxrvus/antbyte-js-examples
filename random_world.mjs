// @ts-check
/** @import * as AntByte from "../antbyte-js/lib" AntByte */

import { writeFileSync } from 'fs'
import { run, newWorld, PINS as ALL_PINS, randomInt } from "../antbyte-js/lib.mjs"

const KEEP_FILES = false;

/** @returns {AntByte.World} */
function generateWorld() {
	const world = newWorld()

	const antCount = randomInt(12) + 6

	for (let i = 1; i <= antCount-1; i++) {
		world.ants[i] = generateAnt(i)
	}

	return world
}

const EXCLUDE = ['K', 'X', 'RR', 'VM']

const PINS = ALL_PINS.filter(pin => !EXCLUDE.includes(pin.code));
const INPUTS = PINS.filter(pin => pin.io_type === "Input" || pin.io_type === null);
const OUTPUTS = PINS.filter(pin => pin.io_type === "Output" || pin.io_type === null);

/**
 * @param {typeof PINS} pins
 * @param {[String, Number, Number][]} rules
 */
function includeRange(pins, rules) {
	return rules.flatMap(([code, min, max]) => {
		const pin = pins.find(pin => pin.code == code);

		if (!pin) throw Error("unknown pin:" + code);
		if (pin.size == 1) return code;

		const indexes = [...Array(max - min + 1).keys()];
		return indexes.map(i => code + (i + min).toString(8));
	})
}

/** @param {string[]} array @returns {string[]} */
function distinct(array) {
	return [...new Set(array)];
}

/** @param {number} index @returns {AntByte.Behavior} */
function generateAnt(index) {
	let filteredInputs = includeRange(INPUTS, [
		['C', 0, 3],
		['M', 0, 3],
		['S', 0, 3],
		['T', 0, 3],
		['V', 0, 7],
		['TT', 6, 7],
		['VC', 0o00, 0o57],
		['VA', 0o50, 0o77],
	]);

	let filteredOutputs = includeRange(OUTPUTS, [
		['C', 0, 3],
		['M', 0, 3],
		['S', 0, 3],
		['D', 0, 2],
		['A', 0, 3],
		['AM', 0, 3],
		['W', 0, 1],
	]);

	let allInputs = includeRange(INPUTS, INPUTS.map(pin => [pin.code, 0, pin.size - 1]));
	let allOutputs = includeRange(OUTPUTS, OUTPUTS.map(pin => [pin.code, 0, pin.size - 1]));

	let randomInputs = getSubset(allInputs, randomInt(4));
	let randomOutputs = getSubset(allOutputs, randomInt(8));

	let selectedInputs = distinct(getSubset(filteredInputs, randomInt(4) + 4).concat(randomInputs));
	let selectedOutputs = distinct(getSubset(filteredOutputs, randomInt(4) + 8).concat(randomOutputs));

	if (selectedInputs.length > 8) selectedInputs = selectedInputs.slice(0, 8);

	const inputCount = selectedInputs.length;
	const outputCount = selectedOutputs.length;

	const valueCount = 2 ** inputCount;
	const maxValue = 2 ** outputCount + 1;

	const logic = [];

	for (let i = 0; i < valueCount; i++) logic.push(randomInt(maxValue));

	return { name: index.toString(), outputs: selectedOutputs, inputs: selectedInputs, logic };
}

/** @param {string[]} superSet @param {number} amount @returns {string[]} */
function getSubset(superSet, amount) {
	const pool = [...new Set(superSet)];
	const count = Math.max(0, Math.min(Math.trunc(amount), pool.length));

	// Fisher-Yates shuffle
	for (let i = 0; i < count; i++) {
		const j = i + randomInt(pool.length - i);
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}

	return pool.slice(0, count);
}

const world = generateWorld()

world.cfg = { height: 128, width: 255, speed: 12, fps: 12, decay: 64 }
world.cfg.border = 'collide';
// world.cfg.keys = "asdfghj"

if (KEEP_FILES) {
	const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '-')
	const dirname = import.meta.dirname;
	writeFileSync(`${dirname}/tmp/random_world-${timestamp}.ant.json`, JSON.stringify(world), 'utf-8')
}

run(world)
