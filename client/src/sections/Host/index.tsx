import React, { useState } from 'react';
import { Form, Input, InputNumber, Upload, Layout, Radio, Typography } from 'antd';
import { BankOutlined, HomeOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Viewer } from '../../lib/types';
import { Link } from 'react-router-dom';
import { ListingType } from '../../lib/graphql/globalTypes';
import { iconColor, displayErrorMessage } from '../../lib/utils';
import { UploadChangeParam } from 'antd/lib/upload';

interface Props {
  viewer: Viewer;
}

const { Content } = Layout;
const { Text, Title } = Typography;
const { Item } = Form;

export const Host = ({ viewer }: Props) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBase64Value, setImageBase64Value] = useState<string | null>(null);

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

  return (
    <Content className="host-content">
      <Form layout="vertical">
        <div className="host__form-header">
          <Title level={3} className="host__form-title">
            Hi! Let's get started listing your place.
          </Title>
          <Text type="secondary">
            In this form, we'll collect some basic and additional information about your listing.
          </Text>
        </div>

        <Item label="Home Type">
          <Radio.Group>
            <Radio.Button value={ListingType.APARTMENT}>
              <BankOutlined style={{ color: iconColor }} /> <span>Apartment</span>
            </Radio.Button>
            <Radio.Button value={ListingType.HOUSE}>
              <HomeOutlined style={{ color: iconColor }} /> <span>House</span>
            </Radio.Button>
          </Radio.Group>
        </Item>

        <Item label="Title" extra="Max character count of 45">
          <Input maxLength={45} placeholder="The iconic and luxurious Bel-Air mansion" />
        </Item>

        <Item label="Description of listing" extra="Max character count of 400">
          <Input.TextArea
            rows={3}
            maxLength={400}
            placeholder={`Modern, clean, and iconic home of the Fresh Prince.Situated in the heart of Bel-Air, Los Angeles.`}
          />
        </Item>

        <Item label="Address">
          <Input placeholder="251 North Bristol Avenue" />
        </Item>

        <Item label="City/Town">
          <Input placeholder="Los Angeles" />
        </Item>

        <Item label="State/Province">
          <Input placeholder="California" />
        </Item>

        <Item label="Zip/Postal Code">
          <Input placeholder="Please enter a zip code for your listing!" />
        </Item>

        <Item label="Image" extra="Images have to be under 1MB in size and of type JPG or PNG">
          <div className="host__form-image-upload">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              /* this is to prevent an AJAX req from firing upon uploading the image. */
              action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              /* check if the image is of valid type. */
              beforeUpload={beforeImageUpload}
              /* this will trigger the image is first uploaded and when the image upload is complete. */
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

        <Item label="Price" extra="All prices in $USD/night">
          <InputNumber min={0} placeholder="120" />
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
