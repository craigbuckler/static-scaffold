/*
metalsmith-util
Metalsmith utility functions
*/
module.exports = (() => {

	'use strict';

	// no operation
	function noop(files, metalsmith, done) {
		done();
	}


	// rename files
	// remove hashes and expand to folders
	const
		reHash = /\#/g,
		reSep = /[\\|\/]+/g;
	function rename(files, metalsmith, done) {

		for (let f in files) {

			let newName = f.replace(reHash, '').replace(reSep, '/').toLowerCase().trim();
			if (!newName.includes('index.md')) {
				newName = newName.slice(0, -3) + '/index.md';
			}

			// rename
			if (newName != f) {
				files[newName] = files[f];
				delete files[f];
			}

		}

		done();

	}


	// debug messages
	function debug(files, metalsmith, done) {

		console.log('\nMETADATA:');
		console.log('%j', metalsmith.metadata());

		for (let f in files) {
			let obj = JSON.parse(JSON.stringify(files[f]));
			delete obj.contents;

			console.log('\nPAGE:', f);
			console.log('%j', obj);
		}

		done();

	}


	// public functions
	return {
		noop: noop,
		rename: rename,
		debug: debug
	};

})();
