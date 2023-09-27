import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import { useEffect, useState } from "react";
import {
  Box,
  ChakraProvider,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { parse } from "date-fns";

import Map from "./components/Map";
import Legend from "./components/Legend";

import report20 from "./data/report20";
import report21 from "./data/report21";
import report22 from "./data/report22";
import report23 from "./data/report23";
import "./App.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX;

function dateToDateString(yourDate) {
  // NOTE: uncommented to keep local timezone, going with UTC for now
  // const offset = yourDate.getTimezoneOffset();
  // yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
  return yourDate.toISOString().split("T")[0];
}

const reports = [...report20, ...report21, ...report22, ...report23];

const App = () => {
  const [startDate, setStartDate] = useState(new Date("2023-01-01"));
  const [endDate, setEndDate] = useState(new Date());
  const filterReports = (list, start, end) =>
    list.filter((r) => {
      try {
        // FIXME: doesn't filter in suspicious activities e.g. SUS-002 from 2021
        const dateString = r[2].split("<small> ")[1].split(":")[0];
        const date = parse(dateString, "dd.MM.yyyy", new Date());
        if (date.getTime() >= start && date.getTime() <= end) {
          return true;
        }
        return false;
      } catch (err) {
        return false;
      }
    });
  const [filteredReports, setFilteredReports] = useState(
    filterReports(reports, startDate, endDate)
  );

  useEffect(() => {
    const newFilteredReports = filterReports(reports, startDate, endDate);
    setFilteredReports(newFilteredReports);
  }, [startDate, endDate]);

  return (
    <ChakraProvider>
      <div style={{ margin: "1rem" }}>
        <Text fontSize="xl">Piracy Map '21 - '23 South China Sea - Yemen</Text>
        <Map reports={filteredReports} />
        <Legend />
        <Box position="relative">
          <HStack>
            <VStack alignItems="flex-start">
              <Text py="0.5" fontWeight="bold" color="gray.600">
                Start At
              </Text>
              <Input
                value={dateToDateString(startDate)}
                onChange={(e) =>
                  setStartDate(
                    new Date(
                      // handles clear
                      e.target.value === "" ? "2020-01-01" : e.target.value
                    )
                  )
                }
                placeholder="Select Start Date"
                size="md"
                type="date"
                min="2020-01-01"
                max={dateToDateString(endDate)}
              />
            </VStack>
            <VStack alignItems="flex-start">
              <Text py="0.5" fontWeight="bold" color="gray.600">
                End At
              </Text>
              <Input
                value={dateToDateString(endDate)}
                onChange={(e) =>
                  setEndDate(
                    new Date(
                      // handles clear
                      e.target.value === ""
                        ? dateToDateString(new Date())
                        : e.target.value
                    )
                  )
                }
                placeholder="Select End Date"
                size="md"
                type="date"
                min={dateToDateString(startDate)}
                max={dateToDateString(new Date())}
              />
            </VStack>
          </HStack>
        </Box>
      </div>
    </ChakraProvider>
  );
};

export default App;
