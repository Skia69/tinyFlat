import React from 'react';
import { Button, Card, DatePicker, Divider, Typography } from 'antd';
import moment, { Moment } from 'moment';
import { displayErrorMessage, formatListingPrice } from '../../../../lib/utils';

const { Paragraph, Title } = Typography;

interface Props {
  price: number;
  checkInDate: Moment | null;
  checkOutDate: Moment | null;
  setCheckInDate: (checkInDate: Moment | null) => void;
  setCheckOutDate: (checkOutDate: Moment | null) => void;
}

export const ListingCreateBooking = ({
  price,
  checkInDate,
  checkOutDate,
  setCheckInDate,
  setCheckOutDate,
}: Props) => {
  // disable all the dates that are before today, on the calendar.
  const disabledDate = (currentDate?: Moment) => {
    if (currentDate) {
      const dateIsBeforeEndOfDay = currentDate.isBefore(moment().endOf('day'));

      return dateIsBeforeEndOfDay;
    } else {
      return false;
    }
  };
  // verify whether the checkOutDate is prior to the checkInDate.
  const verifyAndSetCheckOutDate = (selectedCheckedOutDate: Moment | null) => {
    if (checkInDate && selectedCheckedOutDate) {
      if (moment(selectedCheckedOutDate).isBefore(checkInDate, 'days')) {
        return displayErrorMessage(`You can't book date of check out to be prior to check in!`);
      }
    }

    setCheckOutDate(selectedCheckedOutDate);
  };

  const checkOutInputDisabed = !checkInDate; // disable the checkOutDate picker.
  const buttonDisabled = !checkInDate || !checkOutDate; // disable the checkOut button.

  return (
    <div className="listing-booking">
      <Card className="listing-booking__card">
        <div>
          <Paragraph>
            <Title level={2} className="listing-booking__card-title">
              {formatListingPrice(price)}
              <span>/night</span>
            </Title>
          </Paragraph>
          <Divider />
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check In</Paragraph>
            <DatePicker
              value={checkInDate ? checkInDate : undefined}
              format={'YYYY/MM/DD'}
              disabledDate={disabledDate}
              showToday={false}
              onChange={(dateValue) => setCheckInDate(dateValue)}
              onOpenChange={() => setCheckOutDate(null)}
            />
          </div>
          <div className="listing-booking__card-date-picker">
            <Paragraph strong>Check Out</Paragraph>
            <DatePicker
              value={checkOutDate ? checkOutDate : undefined}
              format={'YYYY/MM/DD'}
              disabledDate={disabledDate}
              showToday={false}
              disabled={checkOutInputDisabed}
              onChange={(dateValue) => verifyAndSetCheckOutDate(dateValue)}
            />
          </div>
        </div>
        <Divider />
        <Button
          disabled={buttonDisabled}
          size="large"
          type="primary"
          className="listing-booking__card-cta"
        >
          Request to book!
        </Button>
      </Card>
    </div>
  );
};
