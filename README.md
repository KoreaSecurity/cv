# CV Site

This site is prepared for deployment as a GitHub Pages project site.

Expected repository name:

- `cv`

Expected URL:

- `https://<github-id>.github.io/cv/`

## Content Editing

- Hero text: `content/hero.md`
- Summary stats: `content/highlight-summary.md`
- Profile card: `content/profile-card.md`
- Biography: `content/biography.md`
- CVEs: `content/cves.md`
- International journals: `content/international-journal.md`
- International conferences: `content/international-conference.md`
- Domestic journals: `content/domestic-journal.md`
- Domestic conferences: `content/domestic-conference.md`
- Software registrations: `content/software-registration.md`
- Awards: `content/awards.md`
- Patents: `content/patents.md`
- Ongoing projects: `content/ongoing-projects.md`
- Completed projects: `content/completed-projects.md`

## Deployment

1. Create a new GitHub repository named `cv`
2. Push this folder to the repository
3. Open `Settings > Pages`
4. Set `Deploy from a branch`
5. Select branch `main`
6. Select folder `/ (root)`
7. Save

## Notes

- Profile image: `assets/profile.png`
- Main page: `index.html`
- Detail pages: `pages/*.html`
- Markdown content is loaded dynamically by `app.js`
