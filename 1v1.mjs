// @ts-check
/** @import * as AntByte from "../antbyte-js/lib" AntByte */

import "process";
import { ant, run,  size, bits, byte, $1 } from "../antbyte-js/lib.mjs"

console.log([process.argv[2]])

run({
	cfg: {
		height: 64,
		width: 128,
		starting_pos: "left",
		// @ts-ignore
		border_mode: "obs",
	},
	ants: {
		// @ts-ignore
		1: ant("main", (AC) => {
			let A0, A7, AX = AC;
			return { A0, A7, AX }
		}),
	},
})
