var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

const customRacerName ={
	"Racer 1": "Mario",
    "Racer 2": "Luigi",
    "Racer 3": "Princess Peach",
    "Racer 4": "Yoshi",
    "Racer 5": "Toad",
}

const customTrackName = {
    "Track 1": "Frappe SnowLand",
    "Track 2": "Moo Moo Farm",
    "Track 3": "Koopa Troopa Beach",
    "Track 4": "Kalimari Desert",
    "Track 5": "Wario Stadium",
    "Track 6": "Rainbow Road",
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE


async function handleCreateRace() {
	// render starting UI
	
	const player_id = store.player_id;
	const track_id = store.track_id;

	if (!player_id || !track_id) {
		alert("Please select track and racer to play a game!");
	 	return
	}
	
	try {
			const race = await createRace(player_id, track_id);
			console.log('createRace::',race);
			// render starting UI
			renderAt('#race', renderRaceStartView(race.Track)); 
			// TODO - update the store with the race id
			store.race_id = parseInt(race.ID) - 1;
			// The race has been created, now start the countdown
			// TODO - call the async function runCountdown
			await runCountdown();
			// TODO - call the async function startRace
			await startRace(store.race_id);
			// TODO - call the async function runRace
			const raceRun = await runRace(store.race_id);
			console.log('raceRun::',raceRun);
		} catch(error) {
			console.log("Error in handleCreateRace: ", error);
		} 
	}



	async function runRace(raceID) {

		return new Promise(resolve => {
			const racerInterval = setInterval(async ()=> {
				const data = await getRace(raceID).catch((error) =>
					console.log("getRace error ", error) 
				);
				if(data.status == 'in-progress') {
					renderAt('#leaderBoard', raceProgress(data.positions))
				} else if(data.status == 'finished') {
					clearInterval(racerInterval) // to stop the interval from repeating
					renderAt('#race', resultsView(data.positions)) 
					resolve(data);
				}
				
			},500)
		}).catch(error => console.log(error))
	}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			const interval = setInterval(() => {
				if (timer !== 0) {
				   console.log(timer);
				   document.getElementById('big-numbers').innerHTML = --timer
				} else {
				   clearInterval(interval);
				   resolve();
				   return
				}
			}, 1000);

		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	store.player_id = target.id;
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

		store.track_id = target.id;
	
}

function handleAccelerate() {
	accelerate(store.race_id)
		 .then(()=> console.log("accelerate button clicked"))
		 .catch((error)=>console.log(error))


}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${customRacerName[driver_name]}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
			<img class="racerCard" src="/assets/images/Racer_${id}.png" alt="${customRacerName[driver_name]}"/>	
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
		
			${results}
			
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
		<h3>${customTrackName[name]}</h3>
		<img class="trackCard" src="/assets/images/Track_${id}.png"/>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track.name}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			<div class="rowCenter">
				${raceProgress(positions)}
				<a class="button" href="/race">Start a new race</a>
			</div>
		</main>
	`
}

function raceProgress(positions) {

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {

		if(p.id == store.player_id) {
			return `
			<tr>
				<td>
					<h3 class="marginBottom">${count++} - <span class="player">${customRacerName[p.driver_name]}</span></h3>
				</td>
			</tr>
		`
		}
		else {
			return `
				<tr>
					<td>
						<h3 class="marginBottom">${count++} - ${customRacerName[p.driver_name]}</h3>
					</td>
				</tr>
			`
		}
	})
	
	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard" class="leaderBoard">
				${results.join(' ')}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}


async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	try {
		const data = await fetch(`${SERVER}/api/tracks`, {
			method: "GET",
			dataType: "jsonp",
			...defaultFetchOpts()
		});
		console.log("getTracks", data);
		return data.json();
	} catch (err) {
		console.log("", err);
	}
}

async function getRacers() {
	try {
		const data = await fetch (`${SERVER}/api/cars`, {
			method: "GET",
			dataType: "jsonp",
			...defaultFetchOpts()
		});
		console.log("getRacers", data);
		return data.json();
	} catch (err) {
		console.log("", err);
	}
}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("", err))
}

async function getRace(id) {
	try {
		const data = await fetch(`${SERVER}/api/races/${id}`, {
			method: "GET",
			dataType: "jsonp",
			...defaultFetchOpts(),
		});
		return data.json();
	} catch (error) {
		console.log("Problem with getRace request::", error);
	}
}

function startRace(id) {
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res)
	.catch(err => console.log("Problem with startRace request", err))
}

async function accelerate(id) {
	try {
		await fetch (`${SERVER}/api/races/${id}/accelerate`, {
			method: 'POST',
			...defaultFetchOpts(),
		});
	} catch (error) {
		console.log("Problem with accelerate request", error);
	}
}
