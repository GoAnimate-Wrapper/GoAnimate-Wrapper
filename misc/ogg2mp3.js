const fs = require("fs");
const ogg = require("ogg");
const vorbis = require("vorbis");
const lame = require("node-lame");
const duplex = require("stream").Duplex;

/**
 *
 * @param {Buffer} inputBuffer
 * @returns {Buffer}
 */
module.exports = (inputBuffer) => {
	return new Promise(async (res, rej) => {
		var od = new ogg.Decoder();
		od.on("stream", (stream) => {
			var vd = new vorbis.Decoder();
			var encoder = new lame.Lame({ output: "buffer" });

			var buffers = [];
			vd.on("data", (b) => {
				buffers.push(b);
			});
			vd.on("end", () => {
				encoder.setBuffer(Buffer.concat(buffers));
				encoder
					.encode()
					.then(() => res(encoder.getBuffer()))
					.catch(rej);
			});

			vd.on("error", rej);

			stream.pipe(vd);
		});

		var d = new duplex();
		d.push(inputBuffer);
		d.push(null);
		d.pipe(od);
	});
};
