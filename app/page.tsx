'use client';

import { Box, Typography } from '@mui/material';

import { useDashboard } from '@/lib/api/useDashboard';

import {
  activityDetailStyle,
  activityItemStyle,
  activityListStyle,
  activitySectionStyle,
  activityTimeStyle,
  cardLabelStyle,
  cardNoteStyle,
  cardStyle,
  cardValueStyle,
  codeStyle,
  descriptionStyle,
  errorStyle,
  eyebrowStyle,
  loadingStyle,
  mainStyle,
  pageStyle,
  statsStyle,
  titleStyle,
} from './page.style';

export default function Home() {
  const { data, error, isLoading } = useDashboard();

  return (
    <Box sx={pageStyle}>
      <Box component="main" sx={mainStyle}>
        <Box component="header" sx={{ mb: 4 }}>
          <Typography variant="body2" sx={eyebrowStyle}>
            React · Node.js · Next.js · TypeScript
          </Typography>
          <Typography variant="h4" component="h1" sx={titleStyle}>
            {data ? data.greeting : 'Dashboard'}
          </Typography>
          <Typography sx={descriptionStyle}>
            A small page. React draws this screen, and Next.js runs a Node.js
            route at{' '}
            <Box component="code" sx={codeStyle}>
              /api/stats
            </Box>{' '}
            for the numbers below.
          </Typography>
        </Box>

        {error ? (
          <Typography sx={errorStyle}>Could not load the dashboard.</Typography>
        ) : null}

        {isLoading ? (
          <Typography sx={loadingStyle}>Loading stats…</Typography>
        ) : null}

        {data ? (
          <>
            <Box component="section" sx={statsStyle}>
              {data.stats.map((stat) => (
                <Box component="article" key={stat.label} sx={cardStyle}>
                  <Typography variant="body2" sx={cardLabelStyle}>
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" sx={cardValueStyle}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={cardNoteStyle}>
                    {stat.note}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box component="section" sx={activitySectionStyle}>
              <Typography variant="h6" component="h2">
                Recent activity
              </Typography>
              <Box component="ul" sx={activityListStyle}>
                {data.activity.map((item) => (
                  <Box component="li" key={item.title} sx={activityItemStyle}>
                    <Box>
                      <Typography sx={{ fontWeight: 500 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={activityDetailStyle}>
                        {item.detail}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={activityTimeStyle}>
                      {item.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
