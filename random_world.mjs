// @ts-check
/** @import * as AntByte from "../antbyte-js/lib" AntByte */

import { writeFileSync } from 'fs'
import { run, size, newWorld, PINS, randomInt } from "../antbyte-js/lib.mjs"

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

/** @param {number} index @returns {AntByte.Behavior} */
function generateAnt(index) {
	// todo: just pass probability object
	// manual tweaking...
	const mandatoryInputs = ['M3', 'M2', 'M1', 'M0', 'C0']
	const blockedInputs = [...['R4', 'R5', 'R6', 'R7', 'S4', 'S5', 'S6', 'S7',  'K7', 'K6', 'K5', 'K4', 'K3', 'K2', 'K1', 'K0' ], ...mandatoryInputs]
	const filteredInputs = PINS.input.filter(p => !blockedInputs.includes(p))
	const mandatoryOutputs = ['A2', 'A1', 'A0', 'AM3', 'AM2', 'AM1', 'AM0']
	const blockedOutputs = [...['A4', 'A5', 'A6', 'A7', 'S4', 'S5', 'S6', 'S7', 'M7', 'M6', 'M5', 'M4', 'M3', 'M2', 'M1', 'M0'], ...mandatoryOutputs]
	const filteredOutputs = PINS.output.filter(p => !blockedOutputs.includes(p))
	//

	let inputs = getSubset(filteredInputs, randomInt(4) + 0);
	let outputs = getSubset(filteredOutputs, randomInt(4) + 4);

	// todo: automate
	inputs = [...inputs, ...mandatoryInputs]
	outputs = [...outputs, ...mandatoryOutputs]

	// memory alignment
	const inputMem = inputs.filter(x => x.startsWith('M'))
	outputs = outputs.filter(x => !x.startsWith('M') !== inputMem.includes(x))
		.concat(inputMem.filter(x => !outputs.includes(x)))

	const inputCount = inputs.length;
	const outputCount = outputs.length;

	const valueCount = 2 ** inputCount
	const maxValue = 2 ** outputCount + 1

	const logic = []

	for (let i = 0; i < valueCount; i++) logic.push(randomInt(maxValue))

	return { name: index.toString(), outputs, inputs, logic }
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

world.cfg = { ...size(128), speed: 12, fps: 12, decay: 100, ant_limit: 100 }
// world.cfg.keys = "asdfghj"

if (KEEP_FILES) {
	const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '-')
	const dirname = import.meta.dirname;
	writeFileSync(`${dirname}/tmp/random_world-${timestamp}.ant.json`, JSON.stringify(world), 'utf-8')
}

run(world)
