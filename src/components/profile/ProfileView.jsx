import CompetitiveCard from './CompetitiveCard.jsx'
import MapPerformance from './MapPerformance.jsx'
import ProfileDetails from './ProfileDetails.jsx'
import ProfileHero from './ProfileHero.jsx'
import RecentMatches from './RecentMatches.jsx'
import StatsGrid from './StatsGrid.jsx'
import SteamCs2Panel from '../steam/SteamCs2Panel.jsx'
import MatchmakingSection from '../matchmaking/MatchmakingSection.jsx'
import FaceitSection from '../faceit/FaceitSection.jsx'

export default function ProfileView({ profile, owner = false, onLogout, onProfileChange }) {
  return (
    <div className="player-profile">
      <ProfileHero profile={profile} owner={owner} onLogout={onLogout} />
      <div className="player-layout">
        <div className="player-main">
          <CompetitiveCard competitive={profile.competitive} />
          <SteamCs2Panel steam={profile.steam} />
          <MatchmakingSection
            matchmaking={profile.matchmaking}
            owner={owner}
            onChange={onProfileChange}
          />
          <FaceitSection
            faceit={profile.faceit}
            owner={owner}
            onChange={onProfileChange}
          />
          <StatsGrid stats={profile.stats} />
          <RecentMatches matches={profile.recent_matches} />
          <MapPerformance rows={profile.map_performance} />
        </div>
        <ProfileDetails
          profile={profile}
          owner={owner}
          onChange={onProfileChange}
        />
      </div>
    </div>
  )
}
