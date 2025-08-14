import React, { useState, useContext, useEffect, useMemo } from 'react';
import { UserContext } from '../context/UserContext';
import {
  FaEdit,
  FaSave,
  FaTimes,
  FaUserCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaTrash,
  FaStar,
  FaRegStar,
} from 'react-icons/fa';

const UserProfile = () => {
  const {
    user,
    address,
    paymentMethods,
    defaultPaymentMethod,

    updateProfile,
    updateAddress,

    addPaymentMethod,
    removePaymentMethod,
    makeDefaultPaymentMethod,
    editPaymentMethod, // <-- make sure this exists in your context
  } = useContext(UserContext);

  // ---------- Local editable state ----------
  const initialFormData = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      fullName: user?.fullName || '',
      phoneNumber: user?.phoneNumber || '',
      email: user?.email || '',
      userName: user?.userName || '',
      imageUrl: user?.imageUrl || '',
      address: {
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || '',
      },
    }),
    [user, address]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [isEditing, setIsEditing] = useState({});
  const [loading, setLoading] = useState(false);

  // Add payment method form state
  const [newPm, setNewPm] = useState({
    type: 'bkash', // 'bkash' | 'nagad' | 'card'
    label: '',
    isDefault: false,
    // for card
    brand: '',
    last4: '',
    expMonth: '',
    expYear: '',
    // for wallets
    walletNumberMasked: '',
    msisdn: '',
  });

  // Edit existing payment method state
  const [editingPmId, setEditingPmId] = useState(null);
  const [editFields, setEditFields] = useState({});

  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const toggleEditing = (field) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    setFormData((prev) => {
      if (keys.length === 1) {
        return { ...prev, [name]: value };
      } else {
        const [outerKey, innerKey] = keys;
        return {
          ...prev,
          [outerKey]: {
            ...prev[outerKey],
            [innerKey]: value,
          },
        };
      }
    });
  };

  const saveChanges = async (field) => {
    setLoading(true);
    try {
      if (field.startsWith('address.')) {
        const innerKey = field.split('.')[1];
        const nextAddress = {
          ...formData.address,
          [innerKey]: formData.address?.[innerKey],
        };
        await updateAddress(nextAddress);
      } else {
        await updateProfile({ [field]: formData[field] });
      }
      setIsEditing((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error('Failed to update user profile:', error);
      alert('Could not save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatLabel = (label) =>
    label.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());

  const renderField = (field, label, value, icon) => (
    <div key={field} className="w-full">
      <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-2">
        {icon}
        {formatLabel(label)}
      </label>
      {isEditing[field] ? (
        <div className="flex gap-2 items-center">
          <input
            type="text"
            name={field}
            value={value || ''}
            onChange={handleChange}
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-sm"
          />
          <button
            className="text-green-600 hover:text-green-800"
            onClick={() => saveChanges(field)}
            disabled={loading}
            title="Save"
          >
            <FaSave />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            onClick={() => toggleEditing(field)}
            title="Cancel"
          >
            <FaTimes />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between max-w-md bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2">
          <span className="text-gray-700 truncate">{value || 'N/A'}</span>
          <button
            className="text-yellow-600 hover:text-yellow-700"
            onClick={() => toggleEditing(field)}
            title="Edit"
          >
            <FaEdit />
          </button>
        </div>
      )}
    </div>
  );

  // ---------- Payment methods helpers ----------
  const handleNewPmChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetNewPm = () =>
    setNewPm({
      type: 'bkash',
      label: '',
      isDefault: false,
      brand: '',
      last4: '',
      expMonth: '',
      expYear: '',
      walletNumberMasked: '',
      msisdn: '',
    });

  const submitNewPaymentMethod = async () => {
    try {
      let payload = { type: newPm.type, label: newPm.label, isDefault: newPm.isDefault };

      if (newPm.type === 'card') {
        payload = {
          ...payload,
          brand: newPm.brand || 'Card',
          last4: (newPm.last4 || '').slice(-4),
          expMonth: Number(newPm.expMonth) || undefined,
          expYear: Number(newPm.expYear) || undefined,
        };
      } else {
        payload = {
          ...payload,
          walletNumberMasked: newPm.walletNumberMasked || '',
          msisdn: newPm.msisdn || '',
        };
      }

      await addPaymentMethod(payload);
      resetNewPm();
    } catch (e) {
      console.error('Add payment method failed', e);
      alert(e?.response?.data?.message || 'Failed to add payment method');
    }
  };

  const maskMsisdn = (msisdn) => {
    if (!msisdn) return '';
    return msisdn.replace(/^(\d{2})\d+(\d{2})$/, '$1********$2');
  };

  const renderPmBadge = (pm) => {
    const type = pm.type;
    if (type === 'card') {
      const label = pm.label || `${pm.brand || 'Card'} **** ${pm.last4 || 'XXXX'}`;
      const exp =
        pm.expMonth && pm.expYear ? ` (exp ${String(pm.expMonth).padStart(2, '0')}/${pm.expYear})` : '';
      return `${label}${exp}`;
    }
    const label = pm.label || `${type.toUpperCase()} ${pm.walletNumberMasked || maskMsisdn(pm.msisdn) || ''}`;
    return label;
  };

  // ---------- Edit existing payment method ----------
  const startEditingMethod = (pm) => {
    setEditingPmId(pm._id);
    // Only include editable fields; keep type immutable
    if (pm.type === 'card') {
      setEditFields({
        label: pm.label || '',
        brand: pm.brand || '',
        last4: pm.last4 || '',
        expMonth: pm.expMonth || '',
        expYear: pm.expYear || '',
      });
    } else {
      setEditFields({
        label: pm.label || '',
        walletNumberMasked: pm.walletNumberMasked || '',
        msisdn: pm.msisdn || '',
      });
    }
  };

  const cancelEditMethod = () => {
    setEditingPmId(null);
    setEditFields({});
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({ ...prev, [name]: value }));
  };

  const saveEditedPaymentMethod = async () => {
    try {
      // sanitize numeric fields
      const payload =
        paymentMethods.find((p) => p._id === editingPmId)?.type === 'card'
          ? {
              ...editFields,
              expMonth:
                editFields.expMonth !== '' && !Number.isNaN(Number(editFields.expMonth))
                  ? Number(editFields.expMonth)
                  : undefined,
              expYear:
                editFields.expYear !== '' && !Number.isNaN(Number(editFields.expYear))
                  ? Number(editFields.expYear)
                  : undefined,
              last4: String(editFields.last4 || '').slice(-4),
            }
          : { ...editFields };

      await editPaymentMethod(editingPmId, payload);
      cancelEditMethod();
    } catch (e) {
      console.error('Update payment method failed', e);
      alert(e?.response?.data?.message || 'Failed to update payment method');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 rounded-lg m-10 bg-[#f3f3f3] min-h-screen">
      <h1 className="text-4xl font-bold text-[#232f3e] mb-10 flex items-center gap-3">
        <FaUserCircle className="text-yellow-500" /> My Profile
      </h1>
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-12 border border-yellow-200">
        {/* Personal Information */}
        <section>
          <h2 className="text-2xl font-semibold text-[#232f3e] mb-6 border-b pb-2 flex items-center gap-2">
            <FaUserCircle className="text-yellow-500" /> Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { field: 'firstName', icon: <FaUserCircle className="text-yellow-400" /> },
              { field: 'lastName', icon: <FaUserCircle className="text-yellow-400" /> },
              { field: 'fullName', icon: <FaUserCircle className="text-yellow-400" /> },
              { field: 'email', icon: <FaUserCircle className="text-yellow-400" /> },
              { field: 'phoneNumber', icon: <FaUserCircle className="text-yellow-400" /> },
              { field: 'userName', icon: <FaUserCircle className="text-yellow-400" /> },
              
              
            ].map(({ field, icon }) => renderField(field, field, formData[field], icon))}
          </div>
        </section>

        {/* Address */}
        <section>
          <h2 className="text-2xl font-semibold text-[#232f3e] mb-6 border-b pb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-yellow-500" /> Address
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {['street', 'city', 'state', 'zipCode', 'country'].map((field) =>
              renderField(
                `address.${field}`,
                field,
                formData.address?.[field],
                <FaMapMarkerAlt className="text-yellow-400" />
              )
            )}
          </div>
        </section>

        {/* Payment Methods */}
        <section>
          <h2 className="text-2xl font-semibold text-[#232f3e] mb-6 border-b pb-2 flex items-center gap-2">
            <FaCreditCard className="text-yellow-500" /> Payment Methods
          </h2>

          {/* Existing methods */}
          <div className="space-y-3">
            {(paymentMethods || []).length === 0 ? (
              <div className="text-gray-600">No payment methods saved yet.</div>
            ) : (
              paymentMethods.map((pm) => {
                const isDefault = pm._id === defaultPaymentMethod?._id || pm.isDefault;
                const isEditingPm = pm._id === editingPmId;

                return (
                  <div
                    key={pm._id}
                    className="flex flex-col gap-3 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-3"
                  >
                    {!isEditingPm ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FaCreditCard className="text-yellow-400" />
                          <div className="text-gray-800">
                            <div className="font-medium">{renderPmBadge(pm)}</div>
                            <div className="text-xs text-gray-600 capitalize">Type: {pm.type}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            className={`flex items-center gap-1 ${
                              isDefault ? 'text-yellow-600' : 'text-gray-500 hover:text-yellow-600'
                            }`}
                            disabled={isDefault}
                            title={isDefault ? 'Default' : 'Make default'}
                            onClick={() => !isDefault && makeDefaultPaymentMethod(pm._id)}
                          >
                            {isDefault ? <FaStar /> : <FaRegStar />}
                            <span className="text-sm">{isDefault ? 'Default' : 'Make default'}</span>
                          </button>

                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                            onClick={() => startEditingMethod(pm)}
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="text-red-600 hover:text-red-800"
                            title="Remove"
                            onClick={() => removePaymentMethod(pm._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-700 mb-1">Label</label>
                            <input
                              name="label"
                              value={editFields.label || ''}
                              onChange={handleEditFieldChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2"
                              placeholder="e.g., Personal bKash, Visa **** 4242"
                            />
                          </div>

                          {pm.type === 'card' ? (
                            <>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Brand</label>
                                <input
                                  name="brand"
                                  value={editFields.brand || ''}
                                  onChange={handleEditFieldChange}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                                  placeholder="Visa, MasterCard"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Last 4</label>
                                <input
                                  name="last4"
                                  value={editFields.last4 || ''}
                                  onChange={handleEditFieldChange}
                                  maxLength={4}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                                  placeholder="1234"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Exp. Month</label>
                                <input
                                  name="expMonth"
                                  type="number"
                                  min={1}
                                  max={12}
                                  value={editFields.expMonth || ''}
                                  onChange={handleEditFieldChange}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                                  placeholder="MM"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Exp. Year</label>
                                <input
                                  name="expYear"
                                  type="number"
                                  min={new Date().getFullYear()}
                                  value={editFields.expYear || ''}
                                  onChange={handleEditFieldChange}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                                  placeholder="YYYY"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">Wallet (masked)</label>
                                <input
                                  name="walletNumberMasked"
                                  value={editFields.walletNumberMasked || ''}
                                  onChange={handleEditFieldChange}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                                  placeholder="01*********89"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-700 mb-1">MSISDN (optional)</label>
                                <input
                                  name="msisdn"
                                  value={editFields.msisdn || ''}
                                  onChange={handleEditFieldChange}
                                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                                  placeholder="01XXXXXXXXX"
                                />
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={saveEditedPaymentMethod}
                            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditMethod}
                            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add new method */}
          <div className="mt-8 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Add a new payment method</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={newPm.type}
                  onChange={handleNewPmChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (optional)</label>
                <input
                  name="label"
                  value={newPm.label}
                  onChange={handleNewPmChange}
                  placeholder="e.g., Personal bKash, Visa **** 4242"
                  className="w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isDefault"
                  type="checkbox"
                  name="isDefault"
                  checked={newPm.isDefault}
                  onChange={handleNewPmChange}
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700">
                  Set as default
                </label>
              </div>

              {newPm.type === 'card' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      name="brand"
                      value={newPm.brand}
                      onChange={handleNewPmChange}
                      placeholder="Visa, MasterCard"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last 4</label>
                    <input
                      name="last4"
                      value={newPm.last4}
                      onChange={handleNewPmChange}
                      placeholder="1234"
                      maxLength={4}
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exp. Month</label>
                    <input
                      name="expMonth"
                      type="number"
                      min={1}
                      max={12}
                      value={newPm.expMonth}
                      onChange={handleNewPmChange}
                      placeholder="MM"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Exp. Year</label>
                    <input
                      name="expYear"
                      type="number"
                      min={new Date().getFullYear()}
                      value={newPm.expYear}
                      onChange={handleNewPmChange}
                      placeholder="YYYY"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wallet number (masked)</label>
                    <input
                      name="walletNumberMasked"
                      value={newPm.walletNumberMasked}
                      onChange={handleNewPmChange}
                      placeholder="01*********89"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MSISDN (optional)</label>
                    <input
                      name="msisdn"
                      value={newPm.msisdn}
                      onChange={handleNewPmChange}
                      placeholder="01XXXXXXXXX"
                      className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={submitNewPaymentMethod}
                className="px-4 py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Add method
              </button>
              <button
                onClick={resetNewPm}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Reset
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              For cards, store only brand, last4, and expiry. Avoid collecting full card numbers or CVV on your servers.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserProfile;