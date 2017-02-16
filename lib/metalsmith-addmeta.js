/*
metalsmith-addmeta
adds further meta information for templates
*/
module.exports = (opt) => {

	'use strict';

	opt = opt || {};
	opt.menuLowerCase = !!opt.menuLowerCase;

	var month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

	return (files, metalsmith, done) => {

		let
			meta = metalsmith.metadata(),
			nav = [];

		for (let f in files) {

			let file = files[f];

			// calculate root
			file.root = file.root || meta.rootpath || '../'.repeat(f.split('/').length);

			// URL
			file.url = f.replace('index.html', '');

			// default priority
			file.priority = file.priority || 0.1;

			// date from date, publish, file creation or now
			file.date =
				(Date.parse(file.date) && new Date(file.date)) ||
				(Date.parse(file.publish) && new Date(file.publish)) ||
				(file.stats && file.stats.ctime) || new Date();

			// formatted date
			file.dateFormatted =
				file.date.getUTCDate() + ' ' +
				month[file.date.getUTCMonth()] + ', ' +
				file.date.getUTCFullYear();

			// navigation tree
			let
				navlist = f.split('/').slice(0,-1),
				tNav = nav;

			file.navlist = [
				navlist[0] || 'index',
				navlist[1] || null
			];

			if (!navlist.length) navlist.push('index');

			// menu name
			file.menu = file.menu || navlist[navlist.length - 1];
			if (opt.menuLowerCase) file.menu = file.menu.toLowerCase();

			// default title
			file.title = file.title || file.menu;

			for (let n = 0; n < navlist.length; n++) {

				let
					nItem = navlist[n],
					data = {},
					m = 0, found = -1;

				if (n + 1 === navlist.length) {
					data = {
						item			: nItem,
						level			: n,
						index			: f,
						url				: file.url,
						title			: file.title,
						desc			: file.description,
						menu			: file.menu,
						date			: file.date,
						priority	: file.priority,
						nomenu		: !!file.nomenu,
						orderby		: file.orderby || 'priority',
						reverse		: !!file.reverse
					};
				}

				data.child = data.child || [];

				while (found < 0 && m < tNav.length) {
					if (nItem === tNav[m].item) found = m;
					else m++;
				}

				if (found < 0) {
					tNav.push(data);
					found = tNav.length - 1;
				}

				tNav = tNav[found].child;

			}

		}

		// recurse and reorder navigation
		let rootNav = {
			nomenu		: false,
			orderby		: 'priority',
			reverse		: false,
			level			: -1,
			child			: nav
		};

		orderNav(rootNav);
		addNav(rootNav);
		meta.nav = rootNav.child;

		done();


		// recurse the navigation and sort
		function orderNav(nav) {

			// sort menu
			nav.child.sort((a, b) => {
				return (a[nav.orderby] > b[nav.orderby] ? -1 : 1) * (nav.reverse ? -1 : 1);
			});

			for (let c = 0; c < nav.child.length; c++) orderNav(nav.child[c]);

		}


		// add nav.next, nav.back and nav.parent to pages
		function addNav(nav) {

			for (let c = 0; c < nav.child.length; c++) {

				files[nav.child[c].index].navrel = {
					parent	: nav.url ? { title: nav.title, url: nav.url } : null,
					back		: c === 0 ? null : { title: nav.child[c-1].title, url: nav.child[c-1].url },
					next		: c+1 === nav.child.length ? null : { title: nav.child[c+1].title, url: nav.child[c+1].url },
					child		: nav.child[c].child.map(i => { return { title: i.title, description: i.desc || null, url: i.url }; })
				};

				addNav(nav.child[c]);

			}

		}


	};

};
