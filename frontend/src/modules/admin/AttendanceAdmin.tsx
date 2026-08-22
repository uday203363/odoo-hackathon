import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getBadgeClass, Modal, EmptyState } from '../../ui/components/common';
import { Clock, LogIn, LogOut, Edit3, Search, CheckCircle2, MapPin, Building2, ShieldCheck, Home, Globe, Navigation, Crosshair, Calendar, Trash2, Tag } from 'lucide-react';
import { exportAttendanceCSV } from '../../utils/exportUtils';
import { getCurrentGPSLocation, getGoogleMapsEmbedUrl, calculateDistanceMeters, type GPSCoords } from '../../utils/geoUtils';
import { formatWorkHours, calculateWorkHours } from '../../utils/timeUtils';
import type { AttendanceRecord } from '../../types';

export const AttendanceManager: React.FC = () => {
  const {
    attendance, users, currentUser, checkIn, checkOut, updateAttendance,
    companyLocation, setCompanyLocation, campusCoords, setCampusCoords,
    locationSchedules, addLocationSchedule, deleteLocationSchedule, hasApprovedWFHToday
  } = useApp();

  const isAdmin = currentUser.role === 'admin';
  const [editModal, setEditModal] = useState<AttendanceRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceRecord['status']>('Present');
  const [editNotes, setEditNotes] = useState('');
  const [editRecordLocation, setEditRecordLocation] = useState('');
  const [editRecordDate, setEditRecordDate] = useState('');
  const [search, setSearch] = useState('');

  // Check-In Modal State
  const [checkInModal, setCheckInModal] = useState(false);
  const [checkInMode, setCheckInMode] = useState<'campus' | 'wfh'>('campus');
  const [inputLoc, setInputLoc] = useState('');
  const [currentGPS, setCurrentGPS] = useState<GPSCoords | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // HR Location Config Modal State
  const [locModal, setLocModal] = useState(false);
  const [newCampusLoc, setNewCampusLoc] = useState(companyLocation);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLat, setNewLat] = useState(campusCoords.lat.toString());
  const [newLng, setNewLng] = useState(campusCoords.lng.toString());
  const [configGpsLoading, setConfigGpsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const isWFHApproved = hasApprovedWFHToday(currentUser.employeeId);

  const isConfigWFH = newCampusLoc.toLowerCase().includes('home') || newCampusLoc.toLowerCase().includes('wfh') || newCampusLoc.toLowerCase().includes('remote');

  const displayRecords = isAdmin
    ? attendance.filter(a => a.employeeName.toLowerCase().includes(search.toLowerCase()))
    : attendance.filter(a => a.employeeId === currentUser.employeeId);

  const todayRecord = attendance.find(a => a.employeeId === currentUser.employeeId && a.date === today);

  const handleDetectGPS = async () => {
    setGpsLoading(true);
    try {
      const coords = await getCurrentGPSLocation();
      setCurrentGPS(coords);
      if (coords.address) setInputLoc(coords.address);
    } catch (err: any) {
      alert('Could not fetch GPS location. Please check browser permissions.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleDetectConfigGPS = async () => {
    setConfigGpsLoading(true);
    try {
      const coords = await getCurrentGPSLocation();
      setNewLat(coords.latitude.toString());
      setNewLng(coords.longitude.toString());
      if (coords.address) setNewCampusLoc(coords.address);
      else setNewCampusLoc(`${coords.latitude.toFixed(4)}°, ${coords.longitude.toFixed(4)}°`);
    } catch (err: any) {
      alert('Could not fetch GPS location. Please check browser location permissions.');
    } finally {
      setConfigGpsLoading(false);
    }
  };

  const handleSaveEdit = () => {
    if (editModal) {
      updateAttendance(editModal.id, editStatus, editNotes);
      setEditModal(null);
    }
  };

  const handlePerformCheckIn = async () => {
    let finalLoc = inputLoc.trim();
    if (checkInMode === 'wfh') {
      finalLoc = finalLoc || 'Work From Home';
    } else {
      finalLoc = finalLoc || companyLocation;
    }
    const ok = await checkIn(finalLoc, checkInMode);
    if (ok) setCheckInModal(false);
  };

  const handleQuickWFHCheckIn = async () => {
    const ok = await checkIn('Work From Home', 'wfh');
    if (ok) setCheckInModal(false);
  };

  const handleSaveCampusLocation = () => {
    const parsedLat = parseFloat(newLat);
    const parsedLng = parseFloat(newLng);
    
    // Save to Location Schedule by Date
    addLocationSchedule({
      date: effectiveDate,
      location: newCampusLoc,
      lat: !isNaN(parsedLat) ? parsedLat : undefined,
      lng: !isNaN(parsedLng) ? parsedLng : undefined,
      isWFH: isConfigWFH
    });

    if (effectiveDate === today) {
      setCompanyLocation(newCampusLoc);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        setCampusCoords({ lat: parsedLat, lng: parsedLng });
      }
    }
    setLocModal(false);
  };

  // Distance calculation if GPS available
  const gpsDistanceMeters = currentGPS
    ? calculateDistanceMeters(currentGPS.latitude, currentGPS.longitude, campusCoords.lat, campusCoords.lng)
    : null;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>{isAdmin ? 'Attendance Management & Personal Log' : 'My Attendance'}</h1>
            <p>{isAdmin ? 'Manage company attendance, Google Maps campus location & personal check-in.' : 'Your attendance log and today\'s check-in status.'}</p>
          </div>
          <div style={{ display: 'flex', gap: '.65rem', flexWrap: 'wrap' }}>
            {isAdmin && (
              <button className="btn btn-outline" onClick={() => {
                setNewCampusLoc(companyLocation);
                setEffectiveDate(new Date().toISOString().split('T')[0]);
                setNewLat(campusCoords.lat.toString());
                setNewLng(campusCoords.lng.toString());
                setLocModal(true);
              }}>
                <Building2 size={15} /> Configure Location by Date
              </button>
            )}
            {isAdmin && (
              <button className="btn btn-outline" onClick={() => exportAttendanceCSV(attendance)}>
                Export CSV
              </button>
            )}

            {!todayRecord?.checkIn && (
              <button className="btn btn-accent" onClick={() => {
                setCheckInMode(isWFHApproved ? 'wfh' : 'campus');
                setInputLoc('');
                setCheckInModal(true);
              }}>
                <LogIn size={15} /> Check In
              </button>
            )}
            {todayRecord?.checkIn && !todayRecord.checkOut && (
              <button className="btn btn-danger" onClick={checkOut}>
                <LogOut size={15} /> Check Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Today Personal Status Card */}
      <div className="card" style={{ marginBottom: '1.25rem', borderLeft: `3px solid ${todayRecord?.isWFH ? 'var(--blue)' : 'var(--accent)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem', flexWrap: 'wrap', gap: '.5rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            <CheckCircle2 size={16} color={todayRecord?.isWFH ? 'var(--blue)' : 'var(--accent)'} /> Today's Attendance — {today} ({currentUser.name})
          </h3>
          {isWFHApproved && (
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-bg)', padding: '2px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Home size={12} /> Work From Home Approved
            </span>
          )}
          {todayRecord?.checkIn && (
            <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--green)', background: 'var(--green-bg)', padding: '2px 10px', borderRadius: 99 }}>
              Logged {todayRecord.workHours > 0 ? formatWorkHours(todayRecord.workHours).full : 'Active Shift'}
            </span>
          )}
        </div>
        
        {todayRecord ? (
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>STATUS</span><div style={{ marginTop: '.25rem' }}><span className={getBadgeClass(todayRecord.status)}>{todayRecord.status}</span></div></div>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>CHECK IN</span><div style={{ fontWeight: 700, marginTop: '.25rem' }}>{todayRecord.checkIn || '—'}</div></div>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>CHECK OUT</span><div style={{ fontWeight: 700, marginTop: '.25rem' }}>{todayRecord.checkOut || '—'}</div></div>
            <div><span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontWeight: 600 }}>LOCATION</span><div style={{ fontWeight: 700, marginTop: '.25rem' }}>{todayRecord.location || companyLocation}</div></div>
          </div>
        ) : (
          <p style={{ fontSize: '.83rem', color: 'var(--text-3)', margin: 0 }}>
            Click <strong>Check In</strong> to log your attendance for In-Office Campus or Work From Home.
          </p>
        )}
      </div>

      {/* Location Schedule by Date Overview Card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-header" style={{ marginBottom: '.75rem' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={18} color="var(--primary)" /> Scheduled Company Locations by Date
            </h3>
            <p className="card-subtitle">Overview showing which location is configured for each date.</p>
          </div>
          {isAdmin && (
            <button className="btn btn-outline btn-sm" onClick={() => setLocModal(true)}>
              + Schedule New Date Location
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '.75rem' }}>
          {locationSchedules.map(loc => (
            <div key={loc.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '.75rem .9rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.3rem' }}>
                <span style={{ fontWeight: 800, fontSize: '.85rem', color: 'var(--primary)' }}>
                  <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />{loc.date}
                </span>
                <span className={getBadgeClass(loc.isWFH ? 'WFH' : 'Present')} style={{ fontSize: '.68rem' }}>
                  {loc.isWFH ? 'Work From Home' : 'In-Office Campus'}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '.88rem', margin: '.2rem 0' }}>{loc.location}</div>
              {loc.lat && loc.lng && (
                <div style={{ fontSize: '.72rem', color: 'var(--text-3)' }}>
                  GPS: {loc.lat.toFixed(4)}°, {loc.lng.toFixed(4)}°
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={() => deleteLocationSchedule(loc.id)}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--text-4)', cursor: 'pointer', padding: 2 }}
                  title="Remove schedule"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Search Filter for Admin */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: '1rem', padding: '.75rem 1rem' }}>
          <div className="input-icon-wrap">
            <Search size={15} className="input-icon" />
            <input className="form-control" placeholder="Search employee attendance records by name..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Date</th><th>Status</th><th>Check In</th><th>Check Out</th>
              <th>Hours</th>{isAdmin && <th>Location</th>}<th>Notes</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {displayRecords.length === 0
              ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>No records found.</td></tr>
              : displayRecords.slice(0, 50).map(r => (
                <tr key={r.id}>
                  {isAdmin && <td><div className="emp-cell"><img src={users.find(u => u.employeeId === r.employeeId)?.avatar} alt="" className="emp-avatar" /><div><div className="emp-name">{r.employeeName}</div></div></div></td>}
                  <td style={{ fontWeight: 600 }}>{r.date}</td>
                  <td><span className={getBadgeClass(r.status)}>{r.status}</span></td>
                  <td>{r.checkIn || '—'}</td>
                  <td>{r.checkOut || '—'}</td>
                  <td>
                    {r.workHours > 0
                      ? formatWorkHours(r.workHours).formatted
                      : r.checkIn
                        ? <span style={{ fontSize: '.73rem', fontWeight: 600, color: 'var(--accent)' }}>In Progress</span>
                        : '—'
                    }
                  </td>
                  {isAdmin && <td>{r.location || '—'}</td>}
                  <td style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>{r.notes || '—'}</td>
                  {isAdmin && <td><button className="btn btn-outline btn-sm" onClick={() => { setEditModal(r); setEditStatus(r.status); setEditNotes(r.notes || ''); setEditRecordLocation(r.location || companyLocation); setEditRecordDate(r.date); }}><Edit3 size={13} /></button></td>}
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Check In Modal with Mode Selection */}
      <Modal open={checkInModal} onClose={() => setCheckInModal(false)} title="Attendance Check In" size="md"
        footer={<><button className="btn btn-outline" onClick={() => setCheckInModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handlePerformCheckIn}><LogIn size={14} /> Confirm Check In</button></>}>
        
        {/* Mode selection buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.65rem', marginBottom: '1rem' }}>
          <button
            type="button"
            className={`btn ${checkInMode === 'campus' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '.75rem', flexDirection: 'column', height: 'auto', gap: 4 }}
            onClick={() => { setCheckInMode('campus'); setInputLoc(companyLocation); }}
          >
            <Building2 size={18} />
            <span style={{ fontSize: '.82rem', fontWeight: 700 }}>In-Office Campus</span>
          </button>

          <button
            type="button"
            className={`btn ${checkInMode === 'wfh' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '.75rem', flexDirection: 'column', height: 'auto', gap: 4, borderColor: checkInMode === 'wfh' ? 'var(--blue)' : undefined, background: checkInMode === 'wfh' ? 'var(--blue)' : undefined }}
            onClick={() => { setCheckInMode('wfh'); setInputLoc(''); }}
          >
            <Home size={18} />
            <span style={{ fontSize: '.82rem', fontWeight: 700 }}>Work From Home</span>
          </button>
        </div>

        {checkInMode === 'wfh' ? (
          <div style={{ background: 'var(--blue-bg)', border: '1px solid #bfdbfe', borderRadius: 'var(--r-md)', padding: '1rem', marginBottom: '1rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Home size={20} /> Work From Home Active
            </div>
            <p style={{ fontSize: '.83rem', color: 'var(--text-2)', marginTop: '.4rem', marginBottom: '.75rem' }}>
              Attendance will be marked as <strong>Work From Home</strong> for today ({today}). No map or location required!
            </p>
            <button type="button" className="btn btn-primary" style={{ background: 'var(--blue)', borderColor: 'var(--blue)' }} onClick={handleQuickWFHCheckIn}>
              <LogIn size={15} /> Confirm WFH Check In
            </button>
          </div>
        ) : (
          <>
            {/* GPS Live Detection Button for Campus */}
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-2)', padding: '.65rem .85rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '.8rem', fontWeight: 600 }}>
                <Crosshair size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                {currentGPS ? `GPS: ${currentGPS.latitude.toFixed(4)}°, ${currentGPS.longitude.toFixed(4)}°` : 'Browser GPS Geolocation'}
              </div>
              <button type="button" className="btn btn-sm btn-outline" onClick={handleDetectGPS} disabled={gpsLoading}>
                <Navigation size={12} /> {gpsLoading ? 'Detecting...' : 'Detect GPS'}
              </button>
            </div>

            {gpsDistanceMeters != null && (
              <div style={{ fontSize: '.78rem', color: gpsDistanceMeters < 1000 ? 'var(--green)' : 'var(--text-3)', fontWeight: 700, marginBottom: '.75rem', textAlign: 'right' }}>
                Distance to Campus HQ: {gpsDistanceMeters < 1000 ? `${gpsDistanceMeters} meters` : `${(gpsDistanceMeters / 1000).toFixed(2)} km`}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Campus Location / Address</label>
              <div className="input-icon-wrap">
                <MapPin size={16} className="input-icon" />
                <input
                  className="form-control"
                  value={inputLoc || companyLocation}
                  onChange={e => setInputLoc(e.target.value)}
                  placeholder="e.g. Main HQ Campus"
                />
              </div>
            </div>

            {/* Embedded Google Maps Preview ONLY for Campus mode */}
            <div style={{ marginTop: '1rem', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', height: 160 }}>
              <iframe
                title="Google Maps Location Preview"
                width="100%"
                height="160"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={getGoogleMapsEmbedUrl(inputLoc || companyLocation)}
              />
            </div>
          </>
        )}
      </Modal>

      {/* HR Location Settings Modal with Effective Date & GPS Detection */}
      <Modal open={locModal} onClose={() => setLocModal(false)} title="Configure Office Campus / Location by Date" size="md"
        footer={<><button className="btn btn-outline" onClick={() => setLocModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveCampusLocation}>Save Location for Selected Date</button></>}>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Effective Date *</label>
            <div className="input-icon-wrap">
              <Calendar size={16} className="input-icon" />
              <input
                className="form-control"
                type="date"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Official Location / Campus Name *</label>
            <input
              className="form-control"
              value={newCampusLoc}
              onChange={e => setNewCampusLoc(e.target.value)}
              placeholder="e.g. Work From Home or Main HQ Campus"
            />
          </div>
        </div>

        {/* Quick Presets with Detect Current GPS Location */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
            Quick Location Presets:
          </span>
          <div style={{ display: 'flex', gap: '.45rem', marginTop: '.4rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={handleDetectConfigGPS}
              disabled={configGpsLoading}
              style={{ fontSize: '.75rem', background: 'var(--accent)', borderColor: 'var(--accent)' }}
            >
              <Navigation size={12} /> {configGpsLoading ? 'Detecting GPS...' : '📍 Detect Current GPS Location'}
            </button>

            <button
              type="button"
              className={`btn btn-sm ${isConfigWFH ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setNewCampusLoc('Work From Home'); }}
              style={{ fontSize: '.75rem' }}
            >
              <Home size={12} /> Work From Home
            </button>

            <button
              type="button"
              className={`btn btn-sm ${!isConfigWFH ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setNewCampusLoc('Main HQ — 1088 Market St, San Francisco Campus'); setNewLat('37.7749'); setNewLng('-122.4194'); }}
              style={{ fontSize: '.75rem' }}
            >
              <Building2 size={12} /> San Francisco HQ
            </button>
          </div>
        </div>

        {/* Hide Map & Lat/Lng when Work From Home is selected */}
        {isConfigWFH ? (
          <div style={{ background: 'var(--blue-bg)', border: '1px solid #bfdbfe', borderRadius: 'var(--r-md)', padding: '1rem', textAlign: 'center', margin: '.5rem 0' }}>
            <div style={{ fontWeight: 800, color: 'var(--blue)', fontSize: '.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Home size={18} /> Work From Home Mode Selected
            </div>
            <p style={{ fontSize: '.8rem', color: 'var(--text-2)', marginTop: '.3rem', margin: 0 }}>
              Work From Home does not require map pin or GPS coordinates. Employees can check in from home directly!
            </p>
          </div>
        ) : (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GPS Latitude</label>
                <input className="form-control" type="number" step="any" value={newLat} onChange={e => setNewLat(e.target.value)} placeholder="e.g. 37.7749" />
              </div>
              <div className="form-group">
                <label className="form-label">GPS Longitude</label>
                <input className="form-control" type="number" step="any" value={newLng} onChange={e => setNewLng(e.target.value)} placeholder="e.g. -122.4194" />
              </div>
            </div>

            {/* Embedded Google Maps Preview Frame ONLY for Physical Campus */}
            <div style={{ borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)', height: 160 }}>
              <iframe
                title="Google Maps Campus Location Preview"
                width="100%"
                height="160"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={getGoogleMapsEmbedUrl(newCampusLoc || `${newLat},${newLng}`)}
              />
            </div>
          </>
        )}
      </Modal>

      {/* Edit Attendance Record Modal with Date & Location */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Attendance Record & Location" size="sm"
        footer={<><button className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveEdit}>Save Changes</button></>}>
        {editModal && (
          <>
            <div className="card-flat" style={{ marginBottom: '1rem' }}>
              <p><strong>Employee:</strong> {editModal.employeeName}</p>
              <p><strong>Check In:</strong> {editModal.checkIn || '—'} | <strong>Check Out:</strong> {editModal.checkOut || '—'}</p>
            </div>
            <div className="form-group">
              <label className="form-label">Attendance Date</label>
              <input className="form-control" type="date" value={editRecordDate} onChange={e => setEditRecordDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" value={editRecordLocation} onChange={e => setEditRecordLocation(e.target.value)} placeholder="e.g. Work From Home, Main HQ" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={editStatus} onChange={e => setEditStatus(e.target.value as AttendanceRecord['status'])}>
                <option>Present</option><option>Absent</option><option>Late</option><option>Half-day</option><option>Leave</option><option>WFH</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Notes</label><textarea className="form-control" rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} /></div>
          </>
        )}
      </Modal>
    </div>
  );
};
