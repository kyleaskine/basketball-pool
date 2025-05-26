import React, { useState, useEffect, useCallback } from "react";
import { Team, Matchup, UserInfo, BracketData, Regions } from "./types";
import ModularBracket from "./ModularBracket";
import PrintStyleCompactBracket from "./PrintStyleCompactBracket";
import { UserInfoForm } from "./components/forms/UserInfoForm";
import { tournamentService } from "./services/tournamentService";
import { 
  initializeBracket, 
  findMatchup, 
  clearTeamFromSubsequentRounds, 
  findIncompleteMatchups,
  validateBracket 
} from "./utils/bracketUtils";
import { LoadingSpinner, ErrorDisplay } from "./utils/shared";

interface ResponsiveBasketballPoolEntryFormProps {
  onSubmit?: (formData: { userInfo: UserInfo; bracketData: BracketData }) => void;
  isSubmitting?: boolean;
  initialUserInfo?: UserInfo;
  initialBracketData?: BracketData;
}

const ResponsiveBasketballPoolEntryForm: React.FC<ResponsiveBasketballPoolEntryFormProps> = ({
  onSubmit,
  isSubmitting = false,
  initialUserInfo,
  initialBracketData,
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(
    initialUserInfo || {
      firstName: "",
      lastName: "",
      email: "",
      contact: "",
    }
  );

  const [bracketData, setBracketData] = useState<BracketData | null>(initialBracketData || null);
  const [regions, setRegions] = useState<Regions | null>(null);
  const [tournamentInfo, setTournamentInfo] = useState<any>(null);
  const [isLoadingTournament, setIsLoadingTournament] = useState(true);
  const [tournamentError, setTournamentError] = useState<string | null>(null);
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState<boolean>(false);
  const [isLargeScreen, setIsLargeScreen] = useState<boolean>(false);
  const [preferCompact, setPreferCompact] = useState<boolean | null>(null);
  const [incompleteMatchups, setIncompleteMatchups] = useState<number[]>([]);

  const formRef = React.useRef<HTMLDivElement>(null);
  const bracketRef = React.useRef<HTMLDivElement>(null);

  // Load tournament structure from API
  useEffect(() => {
    const loadTournamentData = async () => {
      try {
        setIsLoadingTournament(true);
        const [structure, info] = await Promise.all([
          tournamentService.getRegions(),
          tournamentService.getTournamentInfo()
        ]);
        
        setRegions(structure);
        setTournamentInfo(info);
        
        // Initialize bracket if we don't have initial data
        if (!initialBracketData) {
          setBracketData(initializeBracket(structure));
        }
        
        setTournamentError(null);
      } catch (error) {
        console.error('Error loading tournament data:', error);
        setTournamentError('Failed to load tournament data. Please refresh the page.');
      } finally {
        setIsLoadingTournament(false);
      }
    };

    loadTournamentData();
  }, [initialBracketData]);

  // Update incomplete matchups whenever bracketData changes
  useEffect(() => {
    if (bracketData) {
      setIncompleteMatchups(findIncompleteMatchups(bracketData));
    }
  }, [bracketData]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1400 && window.innerHeight >= 900);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleUserInfoChange = useCallback((updatedInfo: UserInfo): void => {
    setUserInfo(updatedInfo);
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(updatedInfo).forEach((field) => {
        if (newErrors[field] && updatedInfo[field as keyof UserInfo]) {
          delete newErrors[field];
        }
      });
      return newErrors;
    });
  }, []);

  const handleTeamSelect = useCallback((matchupId: number, team: Team): void => {
    if (!bracketData) return;
    
    const matchupInfo = findMatchup(matchupId, bracketData);
    if (!matchupInfo) return;

    const { matchup, round } = matchupInfo;
    const newBracketData = JSON.parse(JSON.stringify(bracketData)) as BracketData;
    const matchupIndex = newBracketData[round].findIndex(m => m.id === matchupId);
    if (matchupIndex === -1) return;

    const previousWinner = matchup.winner;
    if (previousWinner && previousWinner.name !== team.name) {
      clearTeamFromSubsequentRounds(previousWinner, round, matchupId, newBracketData, findMatchup);
    }

    // Update the current matchup's winner
    newBracketData[round][matchupIndex].winner = team;

    // Update next matchup if exists
    if (matchup.nextMatchupId !== null) {
      const nextMatchupInfo = findMatchup(matchup.nextMatchupId, newBracketData);
      if (nextMatchupInfo) {
        const { round: nextRound } = nextMatchupInfo;
        const nextMatchupIndex = newBracketData[nextRound].findIndex(m => m.id === matchup.nextMatchupId);
        if (nextMatchupIndex !== -1) {
          const isTeamA = matchup.position % 2 === 0;
          if (isTeamA) {
            newBracketData[nextRound][nextMatchupIndex].teamA = team;
          } else {
            newBracketData[nextRound][nextMatchupIndex].teamB = team;
          }
        }
      }
    }

    setBracketData(newBracketData);
  }, [bracketData]);

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!userInfo.firstName.trim()) errors.firstName = "First name is required";
    if (!userInfo.lastName.trim()) errors.lastName = "Last name is required";
    if (!userInfo.email.trim()) errors.email = "Email is required";
    if (!userInfo.email.includes("@")) errors.email = "Please enter a valid email address";

    if (bracketData) {
      const incompleteRounds = validateBracket(bracketData);
      if (incompleteRounds.length > 0) {
        errors.bracket = `Please complete your picks for: ${incompleteRounds.join(", ")}`;
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [userInfo, bracketData]);

  const handleSubmit = useCallback((): void => {
    setSubmitAttempted(true);
    
    if (!validateForm()) {
      if (validationErrors.firstName || validationErrors.lastName || validationErrors.email) {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (validationErrors.bracket) {
        bracketRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        alert(validationErrors.bracket);
      }
      return;
    }

    if (onSubmit && bracketData) {
      onSubmit({ userInfo, bracketData });
    } else {
      alert("Entry submitted successfully!");
    }
  }, [validateForm, bracketData, validationErrors, userInfo, onSubmit]);

  const handleRandomPicks = useCallback((): void => {
    if (!bracketData) return;
    
    const newBracketData = JSON.parse(JSON.stringify(bracketData)) as BracketData;

    // First round - randomly select winners
    newBracketData[1] = bracketData[1].map(matchup => ({
      ...matchup,
      winner: Math.random() > 0.5 ? matchup.teamA : matchup.teamB,
    }));

    // Process subsequent rounds
    for (let round = 2; round <= 6; round++) {
      newBracketData[round] = bracketData[round].map(matchup => {
        const prevRound = round - 1;
        const feedingMatchups = newBracketData[prevRound].filter(m => m.nextMatchupId === matchup.id);
        const teamA = feedingMatchups[0]?.winner || null;
        const teamB = feedingMatchups[1]?.winner || null;
        const winner = teamA && teamB ? (Math.random() > 0.5 ? teamA : teamB) : null;
        
        return { ...matchup, teamA, teamB, winner };
      });
    }

    setBracketData(newBracketData);
  }, [bracketData]);

  const handleFavoritesPicks = useCallback((): void => {
    if (!bracketData) return;
    
    const newBracketData = JSON.parse(JSON.stringify(bracketData)) as BracketData;

    // First round - select higher seeds
    newBracketData[1] = bracketData[1].map(matchup => ({
      ...matchup,
      winner: matchup.teamA && matchup.teamB
        ? matchup.teamA.seed < matchup.teamB.seed ? matchup.teamA : matchup.teamB
        : null,
    }));

    // Process subsequent rounds
    for (let round = 2; round <= 6; round++) {
      newBracketData[round] = bracketData[round].map(matchup => {
        const prevRound = round - 1;
        const feedingMatchups = newBracketData[prevRound].filter(m => m.nextMatchupId === matchup.id);
        const teamA = feedingMatchups[0]?.winner || null;
        const teamB = feedingMatchups[1]?.winner || null;
        const winner = teamA && teamB ? (teamA.seed < teamB.seed ? teamA : teamB) : null;
        
        return { ...matchup, teamA, teamB, winner };
      });
    }

    setBracketData(newBracketData);
  }, [bracketData]);

  const handleClearForm = useCallback((): void => {
    if (window.confirm("Are you sure you want to clear all your picks and personal information?")) {
      setUserInfo({ firstName: "", lastName: "", email: "", contact: "" });
      if (regions) {
        setBracketData(initializeBracket(regions));
      }
      setValidationErrors({});
      setSubmitAttempted(false);
    }
  }, [regions]);

  const toggleViewMode = useCallback(() => {
    setPreferCompact(prev => (prev === null ? isLargeScreen : !prev));
  }, [isLargeScreen]);

  const useCompactView = useCallback(() => {
    return preferCompact !== null ? preferCompact : isLargeScreen;
  }, [preferCompact, isLargeScreen]);

  if (isLoadingTournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingSpinner />
        <p className="text-center mt-4">Loading tournament data...</p>
      </div>
    );
  }

  if (tournamentError || !bracketData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorDisplay error={tournamentError || "Failed to load tournament data"} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-800">
          {tournamentInfo?.name || "Basketball Pool"} {tournamentInfo?.year || ""}
        </h1>
        <p className="text-gray-600 mt-2">
          Fill out your bracket and submit your entry before the tournament begins!
        </p>
        {tournamentInfo?.deadline && (
          <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded">
            <p className="font-medium">Entry Deadline: {tournamentInfo.deadline}</p>
          </div>
        )}
      </header>

      <div ref={formRef}>
        <UserInfoForm
          userInfo={userInfo}
          validationErrors={validationErrors}
          onUserInfoChange={handleUserInfoChange}
          bracketError={validationErrors.bracket}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
        <h3 className="font-bold text-blue-800 mb-2">How to Complete Your Bracket</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Click on a team name to select it as the winner of that matchup</li>
          <li>Winners automatically advance to the next round</li>
          <li>Complete your bracket by selecting a champion</li>
          <li>Use the buttons below to generate random picks or select all favorites</li>
        </ul>
      </div>

      <div ref={bracketRef}>
        {useCompactView() ? (
          <PrintStyleCompactBracket
            bracketData={bracketData}
            onTeamSelect={handleTeamSelect}
            incompleteMatchups={incompleteMatchups}
            submitAttempted={submitAttempted}
          />
        ) : (
          <ModularBracket
            bracketData={bracketData}
            onTeamSelect={handleTeamSelect}
            incompleteMatchups={incompleteMatchups}
            submitAttempted={submitAttempted}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Entry"}
        </button>
        <button
          onClick={handleClearForm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          disabled={isSubmitting}
        >
          Clear Form
        </button>
        <button
          onClick={handleRandomPicks}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={isSubmitting}
        >
          Random Picks
        </button>
        <button
          onClick={handleFavoritesPicks}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          disabled={isSubmitting}
        >
          All Favorites
        </button>
        <button
          onClick={toggleViewMode}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          {useCompactView() ? "Switch to Regular View" : "Switch to Compact View"}
        </button>
      </div>
    </div>
  );
};

export default ResponsiveBasketballPoolEntryForm;