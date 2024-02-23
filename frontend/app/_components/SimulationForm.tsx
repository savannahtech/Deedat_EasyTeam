import { AxiosHost } from "@/axiosGlobal";
import { DailyCommissions, Order, Product, StaffMember } from "@/interfaces";
import {
  BlockStack,
  Box,
  Button,
  DatePicker,
  Icon,
  InlineGrid,
  InlineStack,
  OptionList,
  Popover,
  Scrollable,
  Select,
  TextField,
  useBreakpoints,
} from "@shopify/polaris";
import { ArrowRightIcon, CalendarIcon } from "@shopify/polaris-icons";
import React, { useEffect, useRef, useState } from "react";
import _ from "lodash";
import DailyCommissionsTable from "./DailyCommissionsTable";

function SimulationForm({
  staffMembers,
  selectedResources,
  products,
}: {
  staffMembers: StaffMember[];
  selectedResources: string[];
  products: Product[];
}) {
  const { mdDown, lgUp } = useBreakpoints();
  const shouldShowMultiMonth = lgUp;
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
  );
  const ranges = [
    {
      title: "Today",
      alias: "today",
      period: {
        since: today,
        until: today,
      },
    },
    {
      title: "Yesterday",
      alias: "yesterday",
      period: {
        since: yesterday,
        until: yesterday,
      },
    },
    {
      title: "Last 7 days",
      alias: "last7days",
      period: {
        since: new Date(
          new Date(new Date().setDate(today.getDate() - 7)).setHours(0, 0, 0, 0)
        ),
        until: yesterday,
      },
    },
  ];
  const [popoverActive, setPopoverActive] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState(ranges[0]);
  const [inputValues, setInputValues] = useState<any>({});
  const [{ month, year }, setDate] = useState({
    month: activeDateRange.period.since.getMonth(),
    year: activeDateRange.period.since.getFullYear(),
  });
  const datePickerRef = useRef(null);
  const VALID_YYYY_MM_DD_DATE_REGEX = /^\d{4}-\d{1,2}-\d{1,2}/;
  function isDate(date: any) {
    return !isNaN(new Date(date).getDate());
  }
  function isValidYearMonthDayDateString(date: any) {
    return VALID_YYYY_MM_DD_DATE_REGEX.test(date) && isDate(date);
  }
  function isValidDate(date: any) {
    return date.length === 10 && isValidYearMonthDayDateString(date);
  }
  function parseYearMonthDayDateString(input: any) {
    // Date-only strings (e.g. "1970-01-01") are treated as UTC, not local time
    // when using new Date()
    // We need to split year, month, day to pass into new Date() separately
    // to get a localized Date
    const [year, month, day] = input.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  function formatDateToYearMonthDayDateString(date: any) {
    const year = String(date.getFullYear());
    let month = String(date.getMonth() + 1);
    let day = String(date.getDate());
    if (month.length < 2) {
      month = String(month).padStart(2, "0");
    }
    if (day.length < 2) {
      day = String(day).padStart(2, "0");
    }
    return [year, month, day].join("-");
  }
  function formatDate(date: any) {
    return formatDateToYearMonthDayDateString(date);
  }
  function nodeContainsDescendant(
    rootNode: never,
    descendant: { parentNode: any }
  ) {
    if (rootNode === descendant) {
      return true;
    }
    let parent = descendant.parentNode;
    while (parent != null) {
      if (parent === rootNode) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
  }
  function isNodeWithinPopover(node: { parentNode: any }) {
    return datePickerRef?.current
      ? nodeContainsDescendant(datePickerRef.current, node)
      : false;
  }
  function handleStartInputValueChange(value: any) {
    setInputValues((prevState: any) => {
      return { ...prevState, since: value };
    });
    console.log("handleStartInputValueChange, validDate", value);
    if (isValidDate(value)) {
      const newSince = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newSince <= prevState.period.until
            ? { since: newSince, until: prevState.period.until }
            : { since: newSince, until: newSince };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }
  function handleEndInputValueChange(value: any) {
    setInputValues((prevState: any) => ({ ...prevState, until: value }));
    if (isValidDate(value)) {
      const newUntil = parseYearMonthDayDateString(value);
      setActiveDateRange((prevState) => {
        const newPeriod =
          prevState.period && newUntil >= prevState.period.since
            ? { since: prevState.period.since, until: newUntil }
            : { since: newUntil, until: newUntil };
        return {
          ...prevState,
          period: newPeriod,
        };
      });
    }
  }
  function handleInputBlur({ relatedTarget }: any) {
    const isRelatedTargetWithinPopover =
      relatedTarget != null && isNodeWithinPopover(relatedTarget);
    // If focus moves from the TextField to the Popover
    // we don't want to close the popover
    if (isRelatedTargetWithinPopover) {
      return;
    }
    setPopoverActive(false);
  }
  function handleMonthChange(month: any, year: any) {
    setDate({ month, year });
  }
  function handleCalendarChange({ start, end }: any) {
    const newDateRange = ranges.find((range) => {
      return (
        range.period.since.valueOf() === start.valueOf() &&
        range.period.until.valueOf() === end.valueOf()
      );
    }) || {
      alias: "custom",
      title: "Custom",
      period: {
        since: start,
        until: end,
      },
    };
    setActiveDateRange(newDateRange);
  }
  function apply() {
    setPopoverActive(false);
  }
  function cancel() {
    setPopoverActive(false);
  }
  function monthDiff(
    referenceDate: { year: any; month: any },
    newDate: { year: any; month: any }
  ) {
    return (
      newDate.month -
      referenceDate.month +
      12 * (referenceDate.year - newDate.year)
    );
  }
  useEffect(() => {
    if (activeDateRange) {
      setInputValues({
        since: formatDate(activeDateRange.period.since),
        until: formatDate(activeDateRange.period.until),
      });

      const monthDifference = monthDiff(
        { year, month },
        {
          year: activeDateRange.period.until.getFullYear(),
          month: activeDateRange.period.until.getMonth(),
        }
      );
      if (monthDifference > 1 || monthDifference < 0) {
        setDate({
          month: activeDateRange.period.until.getMonth(),
          year: activeDateRange.period.until.getFullYear(),
        });
      }
    }
  }, [activeDateRange]);
  const buttonValue =
    activeDateRange.title === "Custom"
      ? activeDateRange.period.since.toDateString() +
        " - " +
        activeDateRange.period.until.toDateString()
      : activeDateRange.title;
  const [dailyCommissions, setDailyCommissions] = useState<DailyCommissions[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const {
        period: { since, until },
      } = activeDateRange;
      const { data } = await AxiosHost.post("/orders", {
        start: new Date(since).toISOString(),
        end: new Date(until).toISOString(),
      });

      const sortedData = _.orderBy(data.orders, ["createdAt"], ["desc"]);
      const groupedOrders = _.groupBy(sortedData, "createdAt");
      const items: DailyCommissions[] = [];
      Object.entries(groupedOrders).forEach(([key, value]) => {
        items.push({
          day: new Date(key).toDateString(),
          orders: value,
        });
      });
      setDailyCommissions(items);

      // setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const [selectedStaff, setSelectedStaff] = useState(staffMembers?.[0]?.id);
  const handleSimulate = () => {
    try {
      if (!selectedStaff) {
        alert("Please select a staff member");
        return;
      }
      fetchOrders();
    } catch (error) {}
  };

  return (
    <div>
      <h1>Chose date range and staff member</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Popover
          active={popoverActive}
          autofocusTarget="none"
          preferredAlignment="left"
          preferredPosition="below"
          fluidContent
          sectioned={false}
          fullHeight
          activator={
            <Button
              size="slim"
              icon={CalendarIcon}
              onClick={() => setPopoverActive(!popoverActive)}
            >
              {buttonValue}
            </Button>
          }
          onClose={() => setPopoverActive(false)}
        >
          <Popover.Pane fixed>
            <div ref={datePickerRef}>
              <InlineGrid
                columns={{
                  xs: "1fr",

                  md: "max-content max-content",
                }}
              >
                <Box
                  maxWidth={mdDown ? "516px" : "212px"}
                  width={mdDown ? "100%" : "212px"}
                  padding={{ xs: "500", md: "0" }}
                  paddingBlockEnd={{ xs: "100", md: "0" }}
                >
                  {mdDown ? (
                    <Select
                      label="dateRangeLabel"
                      labelHidden
                      onChange={(value) => {
                        const result = ranges.find(
                          ({ title, alias }) =>
                            title === value || alias === value
                        );
                        setActiveDateRange(result as any);
                      }}
                      value={
                        activeDateRange?.title || activeDateRange?.alias || ""
                      }
                      options={ranges.map(({ alias, title }) => title || alias)}
                    />
                  ) : (
                    <Scrollable style={{ height: "334px" }}>
                      <OptionList
                        options={ranges.map((range) => ({
                          value: range.alias,
                          label: range.title,
                        }))}
                        selected={activeDateRange.alias as any}
                        onChange={(value) => {
                          setActiveDateRange(
                            ranges.find(
                              (range) => range.alias === value[0]
                            ) as any
                          );
                        }}
                      />
                    </Scrollable>
                  )}
                </Box>
                <Box
                  padding={{ xs: "500" }}
                  maxWidth={mdDown ? "320px" : "516px"}
                >
                  <BlockStack gap="400">
                    <InlineStack gap="200">
                      <div style={{ flexGrow: 1 }}>
                        <TextField
                          role="combobox"
                          label={"Since"}
                          labelHidden
                          prefix={<Icon source={CalendarIcon} />}
                          value={inputValues.since}
                          onChange={handleStartInputValueChange}
                          onBlur={handleInputBlur}
                          autoComplete="off"
                        />
                      </div>
                      <Icon source={ArrowRightIcon} />
                      <div style={{ flexGrow: 1 }}>
                        <TextField
                          role="combobox"
                          label={"Until"}
                          labelHidden
                          prefix={<Icon source={CalendarIcon} />}
                          value={inputValues.until}
                          onChange={handleEndInputValueChange}
                          onBlur={handleInputBlur}
                          autoComplete="off"
                        />
                      </div>
                    </InlineStack>
                    <div>
                      <DatePicker
                        month={month}
                        year={year}
                        selected={{
                          start: activeDateRange.period.since,
                          end: activeDateRange.period.until,
                        }}
                        onMonthChange={handleMonthChange}
                        onChange={handleCalendarChange}
                        multiMonth={shouldShowMultiMonth}
                        allowRange
                      />
                    </div>
                  </BlockStack>
                </Box>
              </InlineGrid>
            </div>
          </Popover.Pane>
          <Popover.Pane fixed>
            <Popover.Section>
              <InlineStack align="end">
                <Button onClick={cancel}>Cancel</Button>
                <Button onClick={apply}>Apply</Button>
              </InlineStack>
            </Popover.Section>
          </Popover.Pane>
        </Popover>
        <Select
          label=""
          options={staffMembers.map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          onChange={(value) => {
            setSelectedStaff(value);
          }}
          value={selectedStaff}
        />
        <Button loading={loading} onClick={handleSimulate}>
          Simulate
        </Button>
      </div>

      <div>
        <DailyCommissionsTable
          selectedResources={selectedResources}
          dailyCommissions={dailyCommissions}
          products={products}
          selectedStaff={selectedStaff}
        />
      </div>
    </div>
  );
}

export default SimulationForm;
