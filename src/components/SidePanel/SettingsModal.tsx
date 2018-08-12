import * as React from 'react';
import { Modal, Button, Icon } from 'antd';

export interface SettingsModalProps {

}

export interface SettingsModalState {

}

export default class SettingsModal extends React.Component<SettingsModalProps, SettingsModalState> {
  constructor(props: SettingsModalProps) {
    super(props);
    
    
 }
 state = {
  loading: false,
  visible: false,
};

  showModal = () => {
    this.setState({
      visible: true,
    });
  }

  handleOk = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  }

  handleCancel = () => {
    this.setState({ visible: false });
  }

  render() {
    const { visible, loading } = this.state;
    return (
      <div>
        <Button
            onClick={this.showModal}
        >
            <Icon type='setting' />Settings
        </Button>
        <Modal
          visible={visible}
          title="Title"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>Return</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              Submit
            </Button>,
          ]}
        >
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </Modal>
      </div>
    );
  }
}

