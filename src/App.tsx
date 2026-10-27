import { useState } from 'react';
import { GameProvider, useGame, loadSave } from './game/store';
import Layout from './components/Layout';
import MainMenu from './components/MainMenu';
import { MapView, ExploreView, DialogueView } from './components/MapExplore';
import { QuestView, InventoryView, SkillView, CharacterView, FactionView, CityView, AchievementView, ChapterView, EndingView, SaveView, SettingsView } from './components/Systems';
import DeductionView from './components/Deduction';
import GamesView from './components/Games';

function Views() {
  const { state: s } = useGame();
  switch (s.view) {
    case 'map': return <MapView />;
    case 'explore': return <ExploreView />;
    case 'dialogue': return <DialogueView />;
    case 'quests': return <QuestView />;
    case 'deduction': return <DeductionView />;
    case 'games': return <GamesView />;
    case 'inventory': return <InventoryView />;
    case 'skills': return <SkillView />;
    case 'character': return <CharacterView />;
    case 'factions': return <FactionView />;
    case 'city': return <CityView />;
    case 'achievements': return <AchievementView />;
    case 'chapters': return <ChapterView />;
    case 'endings': return <EndingView />;
    case 'saves': return <SaveView />;
    case 'settings': return <SettingsView />;
    default: return <MapView />;
  }
}

export default function App() {
  const [inGame, setInGame] = useState(false);
  const initial = loadSave();
  return (
    <GameProvider initial={initial}>
      {!inGame ? (
        <div className="app"><MainMenu onStart={() => setInGame(true)} /></div>
      ) : (
        <Layout><Views /></Layout>
      )}
    </GameProvider>
  );
}
