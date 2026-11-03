// "Back" inside the site. A toy opened from the home page goes back there (keeping the scroll
// position); a toy opened straight from a link goes to the home page instead of leaving the site.
let moved = false;

export function markInternalNav() { moved = true; }
export function cameFromSite() { return moved; }
