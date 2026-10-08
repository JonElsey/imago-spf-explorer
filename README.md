# SPF Explorer demo

### How to build

This isn't live on GH Pages right now, and won't be until I get the privacy and credits sections sorted. You can build it locally and run via:

1) Clone the GitHub repository
2) Download Node.js (nodejs.org/en/download) and install
3) Once that is installed, go to the root folder of the repo and do `npm install` 
4) do `npm run dev`. This will come up with a link to a localhost URL. Click that.
5) Play around to your heart's content.
   
#### Differences from the original

- Complete rearchitecture. 
	- Now uses React as a framework to handle state. 
		- State is now one object that handles all actions, rather than a whole load of functions that had to interact with one another. 
	- TypeScript rather than JavaScript.
	- Test framework
	- Build by Vite and uses NPM for package management, rather than a Python script
	- Reworked UI components into `components`, moving parts into `lib`. 
	- Big blocks of HTML broken up into constituent parts
	
- Map differences
	- Hovering over an LSOA highlights it, as in `imagolf`. 
	- Switched over to OpenFreeMap from ESRI. This one I'm ambivalent on. It has some nicer properties such as being open source, has layering for text labels (so we can include city names etc dynamically). 
	- Map zoom is fixed to the UK. I've fixed the `imagolf` issue where it restricts it on widescreen. On mobile it is gated by the height, on desktop the width.
	- 
	
- UI differences
	- Side bar is now togglable. Mobile uses the same layout as desktop with a side panel. 
	- "How to use" dialogue is now a panel overlaying the main screen, that pops up on first use. Now a button rather than a drop-down in the sidebar. 
	- Having an LSOA selected and then changing year no longer resets the selection, so you can see how it changes year-on-year now
	- Right sidebar slides in and out 
	
- Other
	- Have removed the part where we search for postcodes as you type. I think it goes against the Nominatim terms of use: https://operations.osmfoundation.org/policies/nominatim/
		- Likewise I've replaced the old API query for determining which nation we're in for the quips with a simple lookup of the LSOA code. 
	- I'd personally be *strongly* in favour of removing the nationality-based quips entirely but your call. They're cute but for a SDR-UK branded/Imago hosted site I think we want to avoid this kind of thing as it can be seen as stereotyping. 
		- It only takes one person to complain for it to become A Thing, and speaking from experience that is best avoided.
		- You could keep some of the content, but just remove the regional accents. 
		- My implementation has reworded them pre-emptively, but feel free to revert. They all live in `lib/quips.ts`. 
		- reworded "LSOA" -> area since scotland and NI don't use LSOAs 
	- Now have a privacy policy section that tells users what data we collect, which should mean we satisfy GDPR once the draft is finalised.
	- Figtree font is now self-hosted. There is a genuine court case where a firm was ordered to pay damage of 100 Euros in Germany because they sent the user's dynamic IP address to Google for a Google Fonts request without informing the user. https://thehackernews.com/2022/01/german-court-rules-websites-embedding.html
	
- GDPR/Privacy
	- open-meteo was used to find the current weather, have reduced the number of API requests we send to one per lookup.
		- coordinates are rounded to 1 km which helps with GDPR (not sending more data than is needed, cant identify exact position)
		- I wonder if we actually want this feature going forward. If nothing else it could do with some more explanation.
	- suggestions for place names no longer filled with innerHTML, which was a potential security issue - had to remove because of TOS 
	- URL string now always has the year rather than the most recent year being implicit, so if we add 2026 data old URLs don't show different data 
	- Various small optimisations to smooth how the code runs e.g. URL updates on a delay 
- Added a credits statement, probably needs some more filling out. 
