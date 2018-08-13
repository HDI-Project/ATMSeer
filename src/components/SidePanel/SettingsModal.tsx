import * as React from 'react';
import { Modal, Button, Icon, Checkbox,InputNumber } from 'antd';

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
  public onChange(checkedValues : any) {
    console.log('checked = ', checkedValues);
  }
  render() {
    const { visible, loading } = this.state;
    const CheckboxGroup = Checkbox.Group;

    const plainOptions = ['Apple', 'Pear', 'Orange'];
    const options = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange' },
    ];
    const optionsWithDisabled = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Pear', value: 'Pear' },
      { label: 'Orange', value: 'Orange', disabled: false },
    ];

    
    return (
      <div>
        <Button
            onClick={this.showModal}
        >
            <Icon type='setting' />Settings
        </Button>
        <Modal
          visible={visible}
          title="Settings"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <Button key="back" onClick={this.handleCancel}>Return</Button>,
            <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
              Submit
            </Button>,
          ]}
        >
          <h4>Methods</h4>
          <br />
          <div>
            <CheckboxGroup options={plainOptions} defaultValue={['Apple']} onChange={this.onChange} />
            <br /><br />
            <CheckboxGroup options={options} defaultValue={['Pear']} onChange={this.onChange} />
            <br /><br />
            <CheckboxGroup options={optionsWithDisabled} disabled={true} defaultValue={['Apple']} onChange={this.onChange} />
          </div>
          <br />
          <h4>Classifier Budget</h4>
          <br />
          <InputNumber min={1} max={10} defaultValue={3} onChange={this.onChange} />
          <br />
        </Modal>
      </div>
    );
  }
}

