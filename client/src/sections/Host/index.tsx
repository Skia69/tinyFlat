import React, { useState } from 'react';
import { Form, Input, InputNumber, Upload, Layout, Radio, Typography, Button } from 'antd';
import { BankOutlined, HomeOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Viewer } from '../../lib/types';
import { Link, Redirect } from 'react-router-dom';
import { ListingType } from '../../lib/graphql/globalTypes';
import { iconColor, displayErrorMessage, displaySuccessNotification } from '../../lib/utils';
import { UploadChangeParam } from 'antd/lib/upload';
import { Store, ValidateErrorEntity } from 'rc-field-form/lib/interface';
import { useMutation } from '@apollo/react-hooks';
import {
  HostListing as HostListingData,
  HostListingVariables,
} from '../../lib/graphql/mutations/HostListing/__generated__/HostListing';
import { HOST_LISTING } from '../../lib/graphql/mutations';

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

export const Host = ({ viewer }: Props) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);
  const [hostListing, { loading, data }] = useMutation<HostListingData, HostListingVariables>(
    HOST_LISTING,
    {
      onCompleted: () => {
        displaySuccessNotification("You've successfully created your listing!");
      },
      onError: () => {
        displayErrorMessage(
          "Sorry! We weren't able to create your listing. Please try again later.",
        );
      },
    },
  );
  // initialize the Form.
  const [form] = Form.useForm();

  // user has to be logged in and connected to stripe in order to host a Listing.
  if (!viewer.id || !viewer.hasWallet) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={4} className="host__form-title">
            You'll have to be signed in and connected with Stripe to host a listing!
          </Title>
          <Text type="secondary">
            We only allow users who've signed in to our application and have connected with Stripe
            to host new listings. You can sign in at the <Link to="/login">/login</Link> page and
            connect with Stripe shortly after.
          </Text>
        </div>
      </Content>
    );
  }

  if (loading) {
    return (
      <Content className="host-content">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Please wait!
          </Title>
          <Text type="secondary">We're creating your listing now.</Text>
        </div>
      </Content>
    );
  }
  // when the form creation is complete, redirect the user to the listing's page.
  if (data?.hostListing) {
    return <Redirect to={`/listing/${data.hostListing.id}`} />;
  }

  const handleHostListing = (values: Store) => {
    // parse the address in order to be picked up by the geocoder.
    const fullAddress = `${values.address}, ${values.city}, ${values.state}, ${values.postalCode}`;
    const input = {
      title: values.title,
      description: values.description,
      image: imageBase64Value as string,
      address: fullAddress,
      type: values.type,
      price: Math.round(values.price * 100),
      numOfGuests: values.numOfGuests,
    };
    // fire the mutation.
    hostListing({
      variables: {
        input,
      },
    });
  };

  const onFinishFailed = (err: ValidateErrorEntity) => {
    if (err) {
      displayErrorMessage('Please complete all required form fields!');
      return;
    }
  };

  const handleImageUpload = (info: UploadChangeParam) => {
    const { file } = info;
    if (file.status === 'uploading') {
      setImageLoading(true);
      return;
    }
    // grab the original file and turn it into base64.
    if (file.status === 'done' && file.originFileObj) {
      // helper function that will receive the original file and process it into base64.
      getBase64Value(file.originFileObj, (imageBase64Value) => {
        setImageBase64Value(imageBase64Value);
        setImageLoading(false);
      });
    }
  };

  return (
    <Content className="host-content">
      <Form
        layout="vertical"
        form={form}
        onFinish={handleHostListing}
        onFinishFailed={onFinishFailed}
      >
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information about your listing.
          </Text>
        </div>

        <Item
          name="type"
          label="Home Type"
          rules={[{ required: true, message: 'Please let us know the home type!' }]}
        >
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <BankOutlined style={{ color: iconColor }} />
              {'  '}
              <span>Apartment</span>
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeOutlined style={{ color: iconColor }} />
              {'  '}
              <span>House</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item
          name="numOfGuests"
          label="Max number of Guests"
          rules={[{ required: true, message: 'Please enter a max number of guests!' }]}
        >
          <InputNumber min={0} placeholder="4" />
        </Item>

        <Item
          name="title"
          label="Title"
          extra="Max character count of 45"
          rules={[{ required: true, message: 'Please enter a title for your listing!' }]}
        >
          <Input maxLength={45} placeholder="The iconic and luxurious Bel-Air mansion" />
        </Item>

        <Item
          name="description"
          label="Description of listing"
          extra="Max character count of 400"
          rules={[{ required: true, message: 'Please enter a description for your listing!' }]}
        >
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder="Modern, clean, and iconic home of the Fresh Price. Situated in the heart of Bel-Air, Los Angeles."
          />
        </Item>

        <Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please enter an address for your listing!' }]}
        >
          <Input placeholder="251 North Bristol Avenue" />
        </Item>

        <Item
          name="city"
          label="City / Town"
          rules={[{ required: true, message: 'Please enter a city (or region) for your listing!' }]}
        >
          <Input placeholder="Los Angeles" />
        </Item>

        <Item
          name="state"
          label="State / Province"
          rules={[{ required: true, message: 'Please enter a state for your listing!' }]}
        >
          <Input placeholder="California" />
        </Item>

        <Item
          name="postalCode"
          label="Zip / Postal Code"
          rules={[{ required: true, message: 'Please enter a zip code for your listing!' }]}
        >
          <Input placeholder="Please enter a zip code for your listing!" />
        </Item>

        <Item
          name="image"
          label="Image"
          extra="Images have to be under 1MB in size and of type JPG or PNG"
          rules={[{ required: true, message: 'Please provide an image for your listing!' }]}
        >
          <div className="host__form-image-upload">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              action="https://httpstat.us/200" // prevent AJAX req from firing.
              beforeUpload={beforeImageUpload}
              onChange={handleImageUpload}
            >
              {imageBase64Value ? (
                // show preview of the image.
                <img src={imageBase64Value} alt="Listing" />
              ) : (
                <div>
                  {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                  <div className="ant-upload-text">Upload</div>
                </div>
              )}
            </Upload>
          </div>
        </Item>

        <Item
          name="price"
          label="Price"
          extra="All prices in $USD / night"
          rules={[{ required: true, message: 'Please provide a listing price!' }]}
        >
          <InputNumber min={0} placeholder="120" />
        </Item>

        <Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Item>
      </Form>
    </Content>
  );
};

const beforeImageUpload = (file: File) => {
  // check if the file type is either jpeg or png.
  const fileIsValidImage = file.type === 'image/jpeg' || file.type === 'image/png';
  // check if the file size is less than 1MB.
  const fileIsValidSize = file.size / 1024 / 1024 < 1;

  if (!fileIsValidImage) {
    displayErrorMessage("You're only able to upload valid JPG or PNG files!");
    return false;
  }

  if (!fileIsValidSize) {
    displayErrorMessage("You're only able to upload valid image files of under 1MB in size!");
    return false;
  }

  return fileIsValidImage && fileIsValidSize;
};

const getBase64Value = (img: File | Blob, callback: (imageBase64Value: string) => void) => {
  const reader = new FileReader();
  // read the content of the Image.
  reader.readAsDataURL(img);
  // the image has been read and loaded and it's in base64 now.
  reader.onload = () => {
    callback(reader.result as string);
  };
};
