import { useMemo } from 'react';

interface Portfolio {
  id: number;
  title: string;
  description: string;
  tags: string[];
  type: string;
  timesUsed?: number;
}

interface Request {
  id: number;
  title: string;
  description: string;
  category: string;
  bounty: number;
}

export function useMatchScore() {
  
  const calculateMatchScore = useMemo(() => {
    return (request: Request, portfolio: Portfolio) => {
      let score = 0;
      const weights = {
        categoryMatch: 30,
        tagMatch: 40,
        titleMatch: 20,
        experienceBonus: 10
      };

      // Category match
      if (request.category === portfolio.type) {
        score += weights.categoryMatch;
      }

      // Tag matching with keyword analysis
      const requestText = `${request.title} ${request.description}`.toLowerCase();
      const matchedTags = portfolio.tags.filter(tag => 
        requestText.includes(tag.toLowerCase())
      );
      
      if (portfolio.tags.length > 0) {
        const tagMatchRatio = matchedTags.length / portfolio.tags.length;
        score += weights.tagMatch * tagMatchRatio;
      }

      // Title similarity
      const requestWords = request.title.toLowerCase().split(/\s+/);
      const portfolioWords = portfolio.title.toLowerCase().split(/\s+/);
      const titleMatches = requestWords.filter(word => 
        portfolioWords.some(pWord => pWord.includes(word) || word.includes(pWord))
      );
      
      if (requestWords.length > 0) {
        const titleMatchRatio = titleMatches.length / requestWords.length;
        score += weights.titleMatch * titleMatchRatio;
      }

      // Experience bonus (portfolios that have been successfully used before)
      if (portfolio.timesUsed && portfolio.timesUsed > 0) {
        const experienceMultiplier = Math.min(portfolio.timesUsed / 10, 1);
        score += weights.experienceBonus * experienceMultiplier;
      }

      return Math.round(Math.min(score, 100));
    };
  }, []);

  const getMatchedPortfolios = useMemo(() => {
    return (request: Request, portfolios: Portfolio[], threshold = 40) => {
      return portfolios
        .map(portfolio => ({
          ...portfolio,
          matchScore: calculateMatchScore(request, portfolio)
        }))
        .filter(item => item.matchScore >= threshold)
        .sort((a, b) => b.matchScore - a.matchScore);
    };
  }, [calculateMatchScore]);

  const getMatchBadgeColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    if (score >= 40) return 'from-blue-500 to-cyan-500';
    return 'from-gray-500 to-slate-500';
  };

  const getMatchLabel = (score: number) => {
    if (score >= 80) return '🔥 Perfect Match';
    if (score >= 60) return '✨ Great Match';
    if (score >= 40) return '👍 Good Match';
    return '🤔 Possible Match';
  };

  return {
    calculateMatchScore,
    getMatchedPortfolios,
    getMatchBadgeColor,
    getMatchLabel
  };
}
